import uuid

from django.contrib.auth.models import User
from django.db import models
from django_fsm import FSMField, transition


class IndexedSource(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=160)
    source_system = models.CharField(max_length=30, default='NETWORK_SHARE')
    root_path = models.TextField()
    is_active = models.BooleanField(default=True)
    watch_enabled = models.BooleanField(default=True)
    include_extensions = models.JSONField(default=list, blank=True)
    exclude_patterns = models.JSONField(default=list, blank=True)
    scan_interval_minutes = models.PositiveIntegerField(default=60)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    last_crawled_at = models.DateTimeField(null=True, blank=True)
    last_successful_crawl_at = models.DateTimeField(null=True, blank=True)
    last_error = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['is_active', 'source_system']),
            models.Index(fields=['watch_enabled', 'scan_interval_minutes']),
        ]

    def __str__(self):
        return f'{self.name} ({self.source_system})'


class _BaseJob(models.Model):
    STATUS_CHOICES = [
        ('QUEUED', 'Queued'),
        ('RUNNING', 'Running'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    status = FSMField(default='QUEUED', choices=STATUS_CHOICES, protected=True)
    source = models.ForeignKey(
        IndexedSource,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='%(class)s_jobs',
    )
    parameters = models.JSONField(default=dict, blank=True)
    requested_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    error_message = models.TextField(blank=True, default='')
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.__class__.__name__} {self.id} ({self.status})'

    @transition(field=status, source='QUEUED', target='RUNNING')
    def start(self):
        return None

    @transition(field=status, source=['QUEUED', 'RUNNING'], target='COMPLETED')
    def complete(self):
        return None

    @transition(field=status, source=['QUEUED', 'RUNNING'], target='FAILED')
    def fail(self, _message=''):
        return None


class CrawlJob(_BaseJob):
    discovered_count = models.PositiveIntegerField(default=0)
    indexed_count = models.PositiveIntegerField(default=0)
    duplicate_count = models.PositiveIntegerField(default=0)
    failed_count = models.PositiveIntegerField(default=0)

    class Meta(_BaseJob.Meta):
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['source', 'status']),
        ]


class HashBackfillJob(_BaseJob):
    batch_size = models.PositiveIntegerField(default=500)
    documents_scanned = models.PositiveIntegerField(default=0)
    documents_indexed = models.PositiveIntegerField(default=0)
    full_hashes_computed = models.PositiveIntegerField(default=0)

    class Meta(_BaseJob.Meta):
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['source', 'status']),
        ]


class IndexedSourceFileState(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('MISSING', 'Missing'),
        ('FAILED', 'Failed'),
    ]

    source = models.ForeignKey(IndexedSource, on_delete=models.CASCADE, related_name='file_states')
    relative_path = models.TextField()
    absolute_path = models.TextField(blank=True, default='')
    document = models.ForeignKey(
        'edms_api.Document',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='indexed_source_states',
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    size_bytes = models.BigIntegerField(default=0)
    source_modified_at = models.DateTimeField(null=True, blank=True)
    last_seen_at = models.DateTimeField(null=True, blank=True)
    last_indexed_at = models.DateTimeField(null=True, blank=True)
    missing_since = models.DateTimeField(null=True, blank=True)
    failure_count = models.PositiveIntegerField(default=0)
    last_error = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['relative_path']
        unique_together = ['source', 'relative_path']
        indexes = [
            models.Index(fields=['source', 'status']),
            models.Index(fields=['source', 'last_seen_at']),
            models.Index(fields=['document']),
        ]

    def __str__(self):
        return f'{self.source_id}:{self.relative_path} ({self.status})'


class DuplicateDecision(models.Model):
    DECISION_CHOICES = [
        ('MERGE', 'Merge'),
        ('IGNORE', 'Ignore'),
    ]
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPLIED', 'Applied'),
        ('IGNORED', 'Ignored'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group_key = models.CharField(max_length=255, db_index=True)
    decision = models.CharField(max_length=32, choices=DECISION_CHOICES)
    status = FSMField(default='PENDING', choices=STATUS_CHOICES, protected=True)
    master_document = models.ForeignKey(
        'edms_api.Document',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='selected_duplicate_decisions',
    )
    candidate_documents = models.JSONField(default=list, blank=True)
    candidate_count = models.PositiveIntegerField(default=0)
    storage_saved_bytes = models.BigIntegerField(default=0)
    notes = models.TextField(blank=True, default='')
    source_system = models.CharField(max_length=30, blank=True, default='')
    document_class = models.CharField(max_length=100, blank=True, default='')
    decided_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    decided_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-decided_at']
        indexes = [
            models.Index(fields=['group_key', 'status']),
        ]

    def __str__(self):
        return f'{self.group_key} {self.decision}'

    @transition(field=status, source='PENDING', target='APPLIED')
    def apply(self):
        return None

    @transition(field=status, source='PENDING', target='IGNORED')
    def ignore(self):
        return None


class DocumentOcrPage(models.Model):
    document = models.ForeignKey('edms_api.Document', on_delete=models.CASCADE, related_name='ocr_pages')
    page_number = models.PositiveIntegerField()
    extracted_text = models.TextField(blank=True, default='')
    confidence = models.FloatField(null=True, blank=True)
    source_engine = models.CharField(max_length=50, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['page_number']
        unique_together = ['document', 'page_number']
        indexes = [
            models.Index(fields=['document', 'page_number']),
        ]

    def __str__(self):
        return f'{self.document_id} page {self.page_number}'


class DocumentOcrEntity(models.Model):
    REVIEW_STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('REJECTED', 'Rejected'),
        ('OVERRIDDEN', 'Overridden'),
    ]

    document = models.ForeignKey('edms_api.Document', on_delete=models.CASCADE, related_name='ocr_entities')
    entity_type = models.CharField(max_length=60)
    entity_value = models.CharField(max_length=255)
    normalized_value = models.CharField(max_length=255, blank=True, default='')
    confidence = models.FloatField(null=True, blank=True)
    method = models.CharField(max_length=30, blank=True, default='ocr_regex')
    source_engine = models.CharField(max_length=50, blank=True, default='')
    source_page = models.PositiveIntegerField(null=True, blank=True)
    source_span = models.JSONField(default=dict, blank=True)
    review_status = models.CharField(max_length=20, choices=REVIEW_STATUS_CHOICES, default='PENDING')
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_ocr_entities')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    review_notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['entity_type', 'entity_value']
        indexes = [
            models.Index(fields=['document', 'entity_type']),
            models.Index(fields=['document', 'review_status']),
            models.Index(fields=['entity_type', 'normalized_value']),
        ]

    def __str__(self):
        return f'{self.entity_type}:{self.entity_value}'


class DocumentMetadataAssertion(models.Model):
    STATUS_CHOICES = [
        ('PROPOSED', 'Proposed'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('SUPERSEDED', 'Superseded'),
    ]
    SOURCE_CHOICES = [
        ('machine', 'Machine'),
        ('manual', 'Manual'),
        ('workflow', 'Workflow'),
    ]

    document = models.ForeignKey('edms_api.Document', on_delete=models.CASCADE, related_name='metadata_assertions')
    field_key = models.CharField(max_length=80)
    value = models.CharField(max_length=255)
    normalized_value = models.CharField(max_length=255, blank=True, default='')
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='machine')
    derived_from_entity = models.ForeignKey(
        DocumentOcrEntity,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='derived_assertions',
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PROPOSED')
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_metadata_assertions',
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    rejected_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='rejected_metadata_assertions',
    )
    rejected_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['field_key', '-updated_at']
        indexes = [
            models.Index(fields=['document', 'status']),
            models.Index(fields=['field_key', 'normalized_value']),
        ]

    def __str__(self):
        return f'{self.document_id}:{self.field_key}={self.value} ({self.status})'
