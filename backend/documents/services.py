from django.db.models import Q

from edms_api.models import Document, OcrJob
from shared.services import AuditService, EventService


class DocumentService:
    @staticmethod
    def queryset(params):
        queryset = Document.objects.all()
        status_filter = params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        ocr_filter = params.get('ocr_status')
        if ocr_filter:
            queryset = queryset.filter(ocr_status=ocr_filter)
        search = params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(id__icontains=search)
                | Q(linked_pl__icontains=search)
                | Q(category__icontains=search)
                | Q(type__icontains=search)
                | Q(description__icontains=search)
            )
        return queryset.order_by('-created_at')

    @staticmethod
    def create(serializer, user, request):
        document = serializer.save(author=user)
        if document.file:
            document.size = getattr(document.file, 'size', document.size)
            document.save(update_fields=['size'])
        AuditService.log('CREATE', 'Document', user=user, entity=document.id, ip_address=request.META.get('REMOTE_ADDR'))
        EventService.publish(
            'DocumentRegistered',
            'Document',
            document.id,
            {
                'name': document.name,
                'type': document.type,
                'status': document.status,
                'revision': document.revision,
            },
            idempotency_key=f'document-create:{document.id}:{document.revision}',
        )
        return document

    @staticmethod
    def create_version(document, file, user, request):
        version = document.create_version(file, user)
        AuditService.log('UPDATE', 'Document', user=user, entity=document.id, ip_address=request.META.get('REMOTE_ADDR'))
        EventService.publish(
            'DocumentSuperseded',
            'Document',
            document.id,
            {'revision': document.revision},
            idempotency_key=f'document-version:{document.id}:{document.revision}',
        )
        return version


class OcrApplicationService:
    @staticmethod
    def start_job(document_id, user, request):
        document = Document.objects.get(id=document_id)
        ocr_job, created = OcrJob.objects.update_or_create(
            document=document,
            defaults={
                'status': 'Queued',
                'created_by': user,
                'error_message': '',
                'started_at': None,
                'completed_at': None,
            },
        )
        document.ocr_status = 'Processing'
        document.save(update_fields=['ocr_status'])
        AuditService.log('OCR', 'OCR', user=user, entity=document_id, ip_address=request.META.get('REMOTE_ADDR'))
        EventService.publish(
            'DocumentRegistered' if created else 'DocumentSuperseded',
            'OcrJob',
            ocr_job.id,
            {'document_id': document_id, 'status': ocr_job.status},
            idempotency_key=f'ocr-job:{document_id}:{ocr_job.id}',
        )
        return ocr_job, created

    @staticmethod
    def result_for_document(document_id):
        document = Document.objects.get(id=document_id)
        ocr_result = OcrJob.objects.filter(document=document).first()
        return {
            'document_id': document_id,
            'status': ocr_result.status if ocr_result else 'Not Started',
            'text': ocr_result.extracted_text if ocr_result else '',
            'confidence': ocr_result.confidence if ocr_result else None,
            'extracted_at': ocr_result.created_at if ocr_result else None,
        }

