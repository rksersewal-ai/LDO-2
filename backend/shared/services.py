from django.db.models import Q
from django.utils import timezone

from edms_api.models import Approval, AuditLog, Case, Document, PlItem, WorkRecord

from .models import DomainEvent
from .request_context import get_correlation_id


class AuditService:
    @staticmethod
    def log(action, module, *, user=None, entity=None, severity='Info', details=None, ip_address=None):
        return AuditLog.log(
            action=action,
            module=module,
            user=user,
            entity=entity,
            severity=severity,
            details=details or {},
            ip_address=ip_address,
        )


class EventService:
    @staticmethod
    def publish(event_type, aggregate_type, aggregate_id, payload=None, *, idempotency_key=''):
        return DomainEvent.objects.create(
            event_type=event_type,
            aggregate_type=aggregate_type,
            aggregate_id=str(aggregate_id),
            payload=payload or {},
            correlation_id=get_correlation_id(),
            idempotency_key=idempotency_key,
        )


class SearchService:
    @staticmethod
    def search(query: str, scope: str = 'ALL'):
        from config_mgmt.serializers import PlItemSerializer
        from documents.serializers import DocumentSerializer
        from work.serializers import CaseSerializer, WorkRecordSerializer

        results = {
            'documents': [],
            'work_records': [],
            'pl_items': [],
            'cases': [],
            'total': 0,
        }

        if scope in ['ALL', 'DOCUMENTS']:
            results['documents'] = DocumentSerializer(
                Document.objects.filter(
                    Q(name__icontains=query)
                    | Q(id__icontains=query)
                    | Q(description__icontains=query)
                    | Q(category__icontains=query)
                )[:10],
                many=True,
            ).data

        if scope in ['ALL', 'WORK']:
            results['work_records'] = WorkRecordSerializer(
                WorkRecord.objects.filter(
                    Q(description__icontains=query)
                    | Q(id__icontains=query)
                    | Q(pl_number__icontains=query)
                    | Q(eoffice_number__icontains=query)
                    | Q(concerned_officer__icontains=query)
                )[:10],
                many=True,
            ).data

        if scope in ['ALL', 'PL']:
            results['pl_items'] = PlItemSerializer(
                PlItem.objects.filter(
                    Q(id__icontains=query)
                    | Q(name__icontains=query)
                    | Q(description__icontains=query)
                    | Q(uvam_item_id__icontains=query)
                    | Q(eligibility_criteria__icontains=query)
                    | Q(procurement_conditions__icontains=query)
                )[:10],
                many=True,
            ).data

        if scope in ['ALL', 'CASES']:
            results['cases'] = CaseSerializer(
                Case.objects.filter(
                    Q(title__icontains=query)
                    | Q(id__icontains=query)
                    | Q(description__icontains=query)
                    | Q(pl_reference__icontains=query)
                )[:10],
                many=True,
            ).data

        results['total'] = sum(len(value) for key, value in results.items() if key != 'total')
        return results

    @staticmethod
    def history_for_user(user):
        history = (
            AuditLog.objects.filter(user=user, action='SEARCH')
            .order_by('-created_at')
            .values_list('entity', flat=True)[:20]
        )
        return [entry for entry in history if entry]


class DashboardService:
    @staticmethod
    def stats():
        return {
            'documents': {
                'total': Document.objects.count(),
                'approved': Document.objects.filter(status__in=['Approved', 'APPROVED']).count(),
                'in_review': Document.objects.filter(status__in=['In Review', 'UNDER_REVIEW']).count(),
                'draft': Document.objects.filter(status__in=['Draft', 'DRAFT']).count(),
            },
            'work_records': {
                'total': WorkRecord.objects.count(),
                'open': WorkRecord.objects.filter(status__in=['Open', 'OPEN']).count(),
                'in_progress': WorkRecord.objects.filter(status__in=['In Progress', 'SUBMITTED']).count(),
                'completed': WorkRecord.objects.filter(status__in=['Completed', 'VERIFIED']).count(),
            },
            'approvals': {
                'pending': Approval.objects.filter(status='Pending').count(),
                'approved': Approval.objects.filter(status='Approved').count(),
                'rejected': Approval.objects.filter(status='Rejected').count(),
            },
            'cases': {
                'open': Case.objects.filter(status__in=['Open', 'OPEN', 'In Progress', 'IN_PROGRESS']).count(),
                'closed': Case.objects.filter(status__in=['Closed', 'CLOSED', 'Resolved']).count(),
            },
            'timestamp': timezone.now(),
        }

