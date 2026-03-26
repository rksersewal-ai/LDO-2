"""
LDO-2 EDMS - Django Admin Configuration
Register models for admin interface
"""

from django.contrib import admin
from .models import (
    Approval,
    AuditLog,
    Case,
    Document,
    DocumentVersion,
    OcrJob,
    PlBomLine,
    PlDocumentLink,
    PlItem,
    WorkRecord,
)

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'status', 'type', 'ocr_status', 'author', 'created_at')
    list_filter = ('status', 'type', 'ocr_status', 'created_at')
    search_fields = ('name', 'id', 'linked_pl')
    readonly_fields = ('id', 'created_at', 'updated_at', 'file_hash')
    fieldsets = (
        ('Basic Info', {'fields': ('id', 'name', 'description', 'type')}),
        ('Status', {'fields': ('status', 'ocr_status', 'ocr_confidence')}),
        ('File', {'fields': ('file', 'size', 'file_hash')}),
        ('OCR', {'fields': ('extracted_text',)}),
        ('Reference', {'fields': ('linked_pl', 'category', 'tags')}),
        ('Audit', {'fields': ('revision', 'author', 'date', 'created_at', 'updated_at')}),
    )

@admin.register(DocumentVersion)
class DocumentVersionAdmin(admin.ModelAdmin):
    list_display = ('document', 'revision', 'author', 'created_at', 'size')
    list_filter = ('document', 'created_at')
    search_fields = ('document__name',)
    readonly_fields = ('document', 'revision', 'created_at')

@admin.register(WorkRecord)
class WorkRecordAdmin(admin.ModelAdmin):
    list_display = ('id', 'pl_number', 'work_category', 'status', 'date', 'user_name')
    list_filter = ('status', 'work_category', 'date')
    search_fields = ('id', 'pl_number', 'description')
    fieldsets = (
        ('Work Info', {'fields': ('id', 'description', 'work_category', 'work_type')}),
        ('Status', {'fields': ('status',)}),
        ('Details', {'fields': ('date', 'pl_number', 'eoffice_number', 'drawing_number')}),
        ('Tracking', {'fields': ('days_taken', 'target_days')}),
        ('Responsibility', {'fields': ('user_name', 'verified_by')}),
        ('Notes', {'fields': ('remarks',)}),
        ('Audit', {'fields': ('created_at', 'updated_at')}),
    )

@admin.register(PlItem)
class PlItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'status', 'vendor_type', 'uvam_item_id', 'category')
    list_filter = ('status', 'category', 'vendor_type')
    search_fields = ('id', 'name', 'part_number', 'uvam_item_id')
    readonly_fields = ('created_at', 'last_updated')

@admin.register(PlDocumentLink)
class PlDocumentLinkAdmin(admin.ModelAdmin):
    list_display = ('pl_item', 'document', 'link_role', 'linked_at')
    list_filter = ('link_role', 'linked_at')
    search_fields = ('pl_item__id', 'document__id', 'document__name')
    readonly_fields = ('linked_at', 'updated_at')

@admin.register(PlBomLine)
class PlBomLineAdmin(admin.ModelAdmin):
    list_display = ('parent', 'child', 'find_number', 'quantity', 'unit_of_measure')
    list_filter = ('unit_of_measure',)
    search_fields = ('parent__id', 'child__id', 'find_number')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(Case)
class CaseAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'severity', 'status', 'assigned_to', 'opened_at')
    list_filter = ('status', 'severity', 'opened_at')
    search_fields = ('id', 'title', 'pl_reference')
    fieldsets = (
        ('Basic Info', {'fields': ('id', 'title', 'description')}),
        ('Severity & Status', {'fields': ('severity', 'status')}),
        ('Reference', {'fields': ('pl_reference', 'document')}),
        ('Dates', {'fields': ('opened_at', 'closed_at')}),
        ('Responsibility', {'fields': ('assigned_to', 'resolved_by')}),
        ('Resolution', {'fields': ('resolution', 'resolved_at')}),
    )

@admin.register(OcrJob)
class OcrJobAdmin(admin.ModelAdmin):
    list_display = ('id', 'document', 'status', 'confidence', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('id', 'document__name')
    readonly_fields = ('id', 'created_at', 'updated_at')

@admin.register(Approval)
class ApprovalAdmin(admin.ModelAdmin):
    list_display = ('id', 'entity_type', 'entity_id', 'status', 'requested_by', 'requested_at')
    list_filter = ('status', 'entity_type', 'requested_at')
    search_fields = ('id', 'entity_id')
    fieldsets = (
        ('Entity', {'fields': ('entity_type', 'entity_id')}),
        ('Status', {'fields': ('status',)}),
        ('Users', {'fields': ('requested_by', 'approved_by', 'rejected_by')}),
        ('Details', {'fields': ('comment', 'rejection_reason')}),
        ('Dates', {'fields': ('requested_at', 'approved_at', 'rejected_at')}),
    )

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'action', 'module', 'user', 'severity', 'created_at')
    list_filter = ('action', 'module', 'severity', 'user', 'created_at')
    search_fields = ('id', 'entity', 'user__username')
    readonly_fields = ('id', 'created_at')
    
    def has_add_permission(self, request):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser
