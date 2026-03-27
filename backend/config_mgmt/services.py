from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from django.db.models import Q
from rest_framework.exceptions import ValidationError

from edms_api.models import Document, PlBomLine, PlDocumentLink, PlItem
from shared.services import AuditService, EventService


class PlItemService:
    @staticmethod
    def queryset(params):
        queryset = PlItem.objects.all().prefetch_related('document_links__document', 'bom_parents')
        search = params.get('search')
        if search:
            queryset = queryset.filter(
                Q(id__icontains=search)
                | Q(name__icontains=search)
                | Q(description__icontains=search)
                | Q(uvam_item_id__icontains=search)
                | Q(eligibility_criteria__icontains=search)
                | Q(procurement_conditions__icontains=search)
                | Q(design_supervisor__icontains=search)
                | Q(concerned_supervisor__icontains=search)
            )
        return queryset.order_by('id')

    @staticmethod
    def linked_documents(pl_item):
        return pl_item.document_links.select_related('document').all()

    @staticmethod
    @transaction.atomic
    def set_documents(pl_item, document_ids, request):
        valid_documents = {document.id: document for document in Document.objects.filter(id__in=document_ids)}
        missing_ids = [doc_id for doc_id in document_ids if doc_id not in valid_documents]
        if missing_ids:
            raise ValidationError({'document_ids': [f'Documents not found: {", ".join(missing_ids)}']})

        current_ids = set(pl_item.document_links.values_list('document_id', flat=True))
        target_ids = set(document_ids)

        for doc_id in current_ids - target_ids:
            PlDocumentLink.objects.filter(pl_item=pl_item, document_id=doc_id).delete()
            if not PlDocumentLink.objects.filter(document_id=doc_id).exists():
                Document.objects.filter(id=doc_id).update(linked_pl=None)

        for doc_id in target_ids - current_ids:
            document = valid_documents[doc_id]
            PlDocumentLink.objects.create(
                pl_item=pl_item,
                document=document,
                link_role='TECHNICAL_EVALUATION'
                if (document.category or '').upper() == 'TECHNICAL_EVALUATION'
                else 'GENERAL',
            )
            document.linked_pl = pl_item.id
            document.save(update_fields=['linked_pl'])

        AuditService.log('UPDATE', 'Document', user=request.user, entity=pl_item.id, ip_address=request.META.get('REMOTE_ADDR'))
        EventService.publish(
            'PlLinkedToDocument',
            'PlItem',
            pl_item.id,
            {'document_ids': document_ids},
            idempotency_key=f'pl-documents-set:{pl_item.id}:{",".join(sorted(target_ids))}',
        )
        return pl_item

    @staticmethod
    @transaction.atomic
    def link_document(pl_item, document_id, link_role, notes, request):
        document = Document.objects.get(id=document_id)
        link, created = PlDocumentLink.objects.get_or_create(
            pl_item=pl_item,
            document=document,
            defaults={'link_role': link_role or 'GENERAL', 'notes': notes or ''},
        )
        if not created:
            link.link_role = link_role or link.link_role
            link.notes = notes if notes is not None else link.notes
            link.save(update_fields=['link_role', 'notes', 'updated_at'])
        document.linked_pl = pl_item.id
        document.save(update_fields=['linked_pl'])
        AuditService.log('UPDATE', 'Document', user=request.user, entity=pl_item.id, ip_address=request.META.get('REMOTE_ADDR'))
        EventService.publish(
            'PlLinkedToDocument',
            'PlItem',
            pl_item.id,
            {'document_id': document_id, 'link_role': link.link_role},
            idempotency_key=f'pl-document-link:{pl_item.id}:{document_id}',
        )
        return link

    @staticmethod
    @transaction.atomic
    def unlink_document(link, request):
        pl_item_id = link.pl_item_id
        document_id = link.document_id
        link.delete()
        if not PlDocumentLink.objects.filter(document_id=document_id).exists():
            Document.objects.filter(id=document_id).update(linked_pl=None)
        AuditService.log('UPDATE', 'Document', user=request.user, entity=pl_item_id, ip_address=request.META.get('REMOTE_ADDR'))
        EventService.publish(
            'PlLinkedToDocument',
            'PlItem',
            pl_item_id,
            {'document_id': document_id, 'action': 'unlink'},
            idempotency_key=f'pl-document-unlink:{pl_item_id}:{document_id}',
        )

    @staticmethod
    def bom_tree(pl_item, max_depth):
        def build_tree(parent, depth, visited):
            if depth > max_depth or parent.id in visited:
                return []
            next_visited = set(visited)
            next_visited.add(parent.id)
            lines = (
                PlBomLine.objects.filter(parent=parent)
                .select_related('child')
                .order_by('line_order', 'find_number', 'id')
            )
            return [
                {
                    'id': str(line.id),
                    'parent': line.parent_id,
                    'child': line.child_id,
                    'child_name': line.child.name,
                    'quantity': str(line.quantity),
                    'unit_of_measure': line.unit_of_measure,
                    'find_number': line.find_number,
                    'line_order': line.line_order,
                    'reference_designator': line.reference_designator,
                    'remarks': line.remarks,
                    'children': build_tree(line.child, depth + 1, next_visited),
                }
                for line in lines
            ]

        return {'pl_item': pl_item.id, 'max_depth': max_depth, 'children': build_tree(pl_item, 1, set())}

    @staticmethod
    def where_used(pl_item):
        parents = PlBomLine.objects.filter(child=pl_item).select_related('parent').order_by('parent__id', 'line_order')
        return [
            {
                'parent_pl': line.parent_id,
                'parent_name': line.parent.name,
                'quantity': str(line.quantity),
                'find_number': line.find_number,
                'unit_of_measure': line.unit_of_measure,
            }
            for line in parents
        ]


class BomService:
    @staticmethod
    def create(serializer, request):
        try:
            line = serializer.save()
        except DjangoValidationError as exc:
            raise ValidationError(exc.message_dict if hasattr(exc, 'message_dict') else exc.messages) from exc
        AuditService.log('CREATE', 'Document', user=request.user, entity=str(line.id), ip_address=request.META.get('REMOTE_ADDR'))
        EventService.publish(
            'BomChanged',
            'PlBomLine',
            line.id,
            {'parent': line.parent_id, 'child': line.child_id, 'find_number': line.find_number},
            idempotency_key=f'bom-create:{line.id}',
        )
        return line

    @staticmethod
    def update(serializer, request):
        try:
            line = serializer.save()
        except DjangoValidationError as exc:
            raise ValidationError(exc.message_dict if hasattr(exc, 'message_dict') else exc.messages) from exc
        AuditService.log('UPDATE', 'Document', user=request.user, entity=str(line.id), ip_address=request.META.get('REMOTE_ADDR'))
        EventService.publish(
            'BomChanged',
            'PlBomLine',
            line.id,
            {'parent': line.parent_id, 'child': line.child_id, 'find_number': line.find_number},
            idempotency_key=f'bom-update:{line.id}:{line.updated_at.isoformat()}',
        )
        return line

    @staticmethod
    def delete(line, request):
        payload = {'parent': line.parent_id, 'child': line.child_id, 'find_number': line.find_number}
        line_id = line.id
        line.delete()
        AuditService.log('DELETE', 'Document', user=request.user, entity=str(line_id), ip_address=request.META.get('REMOTE_ADDR'))
        EventService.publish(
            'BomChanged',
            'PlBomLine',
            line_id,
            payload | {'action': 'delete'},
            idempotency_key=f'bom-delete:{line_id}',
        )

    @staticmethod
    @transaction.atomic
    def move(line, *, parent=None, line_order=None, find_number=None, request=None):
        if parent:
            line.parent_id = parent
        if line_order is not None:
            line.line_order = line_order
        if find_number:
            line.find_number = find_number
        try:
            line.full_clean()
            line.save()
        except DjangoValidationError as exc:
            raise ValidationError(exc.message_dict if hasattr(exc, 'message_dict') else exc.messages) from exc
        if request is not None:
            AuditService.log('UPDATE', 'Document', user=request.user, entity=str(line.id), ip_address=request.META.get('REMOTE_ADDR'))
        EventService.publish(
            'BomChanged',
            'PlBomLine',
            line.id,
            {'parent': line.parent_id, 'child': line.child_id, 'find_number': line.find_number, 'action': 'move'},
            idempotency_key=f'bom-move:{line.id}:{line.updated_at.isoformat()}',
        )
        return line
