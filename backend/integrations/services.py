from shared.models import DomainEvent


class IntegrationDispatcher:
    @staticmethod
    def pending_events(limit=100):
        return DomainEvent.objects.filter(status='PENDING').order_by('created_at')[:limit]

