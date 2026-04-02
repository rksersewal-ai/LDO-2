from django.contrib import admin

from .models import DomainEvent, ReportJob


@admin.register(DomainEvent)
class DomainEventAdmin(admin.ModelAdmin):
    list_display = ('event_type', 'aggregate_type', 'aggregate_id', 'status', 'created_at')
    search_fields = ('event_type', 'aggregate_type', 'aggregate_id', 'correlation_id')
    list_filter = ('status', 'event_type', 'aggregate_type')
    readonly_fields = ('id', 'created_at', 'published_at')


@admin.register(ReportJob)
class ReportJobAdmin(admin.ModelAdmin):
    list_display = ('report_type', 'export_format', 'status', 'requested_by', 'created_at', 'completed_at')
    search_fields = ('report_type', 'correlation_id', 'file_key')
    list_filter = ('status', 'export_format', 'report_type')
    readonly_fields = ('id', 'correlation_id', 'created_at', 'updated_at', 'started_at', 'completed_at')
