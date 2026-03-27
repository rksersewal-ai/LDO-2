import uuid

from django.db import models


class DomainEvent(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('DISPATCHED', 'Dispatched'),
        ('FAILED', 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event_type = models.CharField(max_length=120, db_index=True)
    aggregate_type = models.CharField(max_length=120, db_index=True)
    aggregate_id = models.CharField(max_length=120, db_index=True)
    payload = models.JSONField(default=dict, blank=True)
    correlation_id = models.CharField(max_length=64, blank=True, default='')
    idempotency_key = models.CharField(max_length=160, blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    error_message = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    published_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'shared_domain_event'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['event_type', 'created_at']),
        ]

    def __str__(self):
        return f'{self.event_type} {self.aggregate_type}:{self.aggregate_id}'

