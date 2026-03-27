import uuid

from django.contrib.auth.models import User
from django.db import models


class WorkRecordExportJob(models.Model):
    STATUS_CHOICES = [
        ('QUEUED', 'Queued'),
        ('PROCESSING', 'Processing'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ]
    FORMAT_CHOICES = [
        ('xlsx', 'Excel'),
        ('csv', 'CSV'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    requested_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='QUEUED')
    export_format = models.CharField(max_length=10, choices=FORMAT_CHOICES, default='xlsx')
    filters = models.JSONField(default=dict, blank=True)
    file_key = models.CharField(max_length=255, blank=True, default='')
    correlation_id = models.CharField(max_length=64, blank=True, default='')
    error_message = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'work_record_export_job'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.export_format} export {self.id} ({self.status})'

