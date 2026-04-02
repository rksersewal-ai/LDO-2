import uuid

from django.contrib.auth.models import User
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


class ReportJob(models.Model):
    STATUS_CHOICES = [
        ('QUEUED', 'Queued'),
        ('PROCESSING', 'Processing'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ]

    FORMAT_CHOICES = [
        ('csv', 'CSV'),
        ('xlsx', 'Excel'),
        ('pdf', 'PDF'),
        ('docx', 'Word'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    report_type = models.CharField(max_length=120, db_index=True)
    export_format = models.CharField(max_length=16, choices=FORMAT_CHOICES, default='xlsx')
    filters = models.JSONField(default=dict, blank=True)
    parameters = models.JSONField(default=dict, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='QUEUED', db_index=True)
    requested_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='requested_report_jobs')
    file_key = models.CharField(max_length=255, blank=True, default='')
    correlation_id = models.CharField(max_length=64, blank=True, default='')
    result_summary = models.JSONField(default=dict, blank=True)
    error_message = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'shared_report_job'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'created_at'], name='shared_repo_status_ba9262_idx'),
            models.Index(fields=['report_type', 'created_at'], name='shared_repo_report__345f7e_idx'),
        ]

    def __str__(self):
        return f'{self.report_type}:{self.id} ({self.status})'
