"""
LDO-2 EDMS - Django Models
Core data models for the document management system
"""

from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import uuid

class Document(models.Model):
    STATUS_CHOICES = [
        ('Draft', 'Draft'),
        ('In Review', 'In Review'),
        ('Approved', 'Approved'),
        ('Obsolete', 'Obsolete'),
    ]
    
    TYPE_CHOICES = [
        ('PDF', 'PDF'),
        ('Word', 'Word'),
        ('Excel', 'Excel'),
        ('Image', 'Image'),
        ('Other', 'Other'),
    ]
    
    OCR_STATUS_CHOICES = [
        ('Not Started', 'Not Started'),
        ('Processing', 'Processing'),
        ('Completed', 'Completed'),
        ('Failed', 'Failed'),
    ]

    id = models.CharField(max_length=50, primary_key=True, default=uuid.uuid4)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='PDF')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Draft')
    
    # File & Storage
    file = models.FileField(upload_to='documents/')
    size = models.BigIntegerField(default=0)  # In bytes
    file_hash = models.CharField(max_length=64, blank=True, null=True)  # SHA-256
    
    # OCR
    ocr_status = models.CharField(max_length=20, choices=OCR_STATUS_CHOICES, default='Not Started')
    ocr_confidence = models.FloatField(default=0.0)  # 0-100
    extracted_text = models.TextField(blank=True, null=True)
    
    # Linking
    linked_pl = models.CharField(max_length=100, blank=True, null=True)  # PL reference
    category = models.CharField(max_length=100, blank=True, null=True)
    tags = models.JSONField(default=list, blank=True)
    
    # Audit
    revision = models.IntegerField(default=1)
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    date = models.DateField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['author']),
            models.Index(fields=['ocr_status']),
        ]
    
    def __str__(self):
        return f"{self.name} (v{self.revision})"
    
    def create_version(self, file, user):
        """Create a new version of this document"""
        self.revision += 1
        self.file = file
        self.size = getattr(file, 'size', self.size)
        self.author = user
        self.updated_at = timezone.now()
        self.save()
        version, _ = DocumentVersion.objects.update_or_create(
            document=self,
            revision=self.revision,
            defaults={
                'file': self.file,
                'size': self.size,
                'author': user,
            }
        )
        return version

class DocumentVersion(models.Model):
    """Track document revision history"""
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='versions')
    revision = models.IntegerField()
    file = models.FileField(upload_to='documents/versions/')
    size = models.BigIntegerField()
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    change_notes = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-revision']
        unique_together = ['document', 'revision']
    
    def __str__(self):
        return f"{self.document.name} v{self.revision}"

class WorkRecord(models.Model):
    STATUS_CHOICES = [
        ('Open', 'Open'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
        ('Closed', 'Closed'),
    ]
    
    CATEGORY_CHOICES = [
        ('Maintenance', 'Maintenance'),
        ('Repair', 'Repair'),
        ('Inspection', 'Inspection'),
        ('Modification', 'Modification'),
        ('Testing', 'Testing'),
    ]

    id = models.CharField(max_length=50, primary_key=True, default=uuid.uuid4)
    description = models.TextField()
    work_category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    work_type = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Open')
    
    # Work Details
    date = models.DateField()
    pl_number = models.CharField(max_length=100, blank=True, null=True)
    eoffice_number = models.CharField(max_length=100, blank=True, null=True)
    drawing_number = models.CharField(max_length=100, blank=True, null=True)
    
    # Tracking
    days_taken = models.IntegerField(default=0)
    target_days = models.IntegerField(default=0)
    
    # Responsibility
    user_name = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='work_records')
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_records')
    
    # Notes
    remarks = models.TextField(blank=True, null=True)
    
    # Audit
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['user_name']),
            models.Index(fields=['date']),
        ]
    
    def __str__(self):
        return f"{self.pl_number} - {self.work_category} ({self.status})"

class PlItem(models.Model):
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
        ('Retired', 'Retired'),
    ]

    id = models.CharField(max_length=100, primary_key=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    part_number = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    
    # Metadata
    category = models.CharField(max_length=100, blank=True, null=True)
    manufacturer = models.CharField(max_length=255, blank=True, null=True)
    specifications = models.JSONField(default=dict, blank=True)
    
    # Audit
    last_updated = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return self.name

class Case(models.Model):
    STATUS_CHOICES = [
        ('Open', 'Open'),
        ('In Progress', 'In Progress'),
        ('Resolved', 'Resolved'),
        ('Closed', 'Closed'),
    ]
    
    SEVERITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Critical', 'Critical'),
    ]

    id = models.CharField(max_length=50, primary_key=True, default=uuid.uuid4)
    title = models.CharField(max_length=255)
    description = models.TextField()
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='Medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Open')
    
    # Reference
    pl_reference = models.CharField(max_length=100, blank=True, null=True)
    document = models.ForeignKey(Document, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Dates
    opened_at = models.DateTimeField(auto_now_add=True)
    closed_at = models.DateTimeField(null=True, blank=True)
    
    # Responsibility
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_cases')
    
    # Resolution
    resolution = models.TextField(blank=True, null=True)
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='resolved_cases')
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-opened_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['severity']),
            models.Index(fields=['assigned_to']),
        ]
    
    def __str__(self):
        return f"{self.id} - {self.title}"

class OcrJob(models.Model):
    STATUS_CHOICES = [
        ('Queued', 'Queued'),
        ('Processing', 'Processing'),
        ('Completed', 'Completed'),
        ('Failed', 'Failed'),
    ]

    id = models.CharField(max_length=50, primary_key=True, default=uuid.uuid4)
    document = models.OneToOneField(Document, on_delete=models.CASCADE, related_name='ocr_job')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Queued')
    
    # Processing
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Result
    extracted_text = models.TextField(blank=True, null=True)
    confidence = models.FloatField(null=True, blank=True)
    error_message = models.TextField(blank=True, null=True)
    
    # Audit
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"OCR Job for {self.document.name} ({self.status})"

class Approval(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    ]

    id = models.CharField(max_length=50, primary_key=True, default=uuid.uuid4)
    
    # Entity reference (polymorphic)
    entity_type = models.CharField(max_length=50)  # 'document', 'case', etc.
    entity_id = models.CharField(max_length=100)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    
    # Audit
    requested_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='approval_requests')
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approvals_given')
    rejected_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approvals_rejected')
    
    # Details
    comment = models.TextField(blank=True, null=True)
    rejection_reason = models.TextField(blank=True, null=True)
    
    # Dates
    requested_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    rejected_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-requested_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['requested_by']),
        ]
    
    def __str__(self):
        return f"Approval for {self.entity_type}:{self.entity_id} ({self.status})"

class AuditLog(models.Model):
    ACTION_CHOICES = [
        ('CREATE', 'Create'),
        ('UPDATE', 'Update'),
        ('DELETE', 'Delete'),
        ('VIEW', 'View'),
        ('DOWNLOAD', 'Download'),
        ('EXPORT', 'Export'),
        ('SEARCH', 'Search'),
        ('LOGIN', 'Login'),
        ('LOGOUT', 'Logout'),
        ('APPROVE', 'Approve'),
        ('REJECT', 'Reject'),
        ('OCR', 'OCR'),
    ]
    
    MODULE_CHOICES = [
        ('Document', 'Document'),
        ('WorkRecord', 'WorkRecord'),
        ('Case', 'Case'),
        ('User', 'User'),
        ('System', 'System'),
        ('OCR', 'OCR'),
        ('Approval', 'Approval'),
    ]
    
    SEVERITY_CHOICES = [
        ('Info', 'Info'),
        ('Warning', 'Warning'),
        ('Error', 'Error'),
        ('Critical', 'Critical'),
    ]

    id = models.CharField(max_length=50, primary_key=True, default=uuid.uuid4)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    module = models.CharField(max_length=50, choices=MODULE_CHOICES)
    entity = models.CharField(max_length=255, blank=True, null=True)  # ID or name of affected entity
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='Info')
    details = models.JSONField(default=dict, blank=True)  # Additional context
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['action']),
            models.Index(fields=['user']),
            models.Index(fields=['module']),
            models.Index(fields=['severity']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.action} - {self.module} by {self.user} at {self.created_at}"
    
    @classmethod
    def log(cls, action, module, user=None, entity=None, severity='Info', details=None, ip_address=None):
        """Convenience method to create audit log entry"""
        return cls.objects.create(
            action=action,
            module=module,
            user=user,
            entity=entity,
            severity=severity,
            details=details or {},
            ip_address=ip_address,
        )
