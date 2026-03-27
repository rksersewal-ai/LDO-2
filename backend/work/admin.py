from django.contrib import admin

from .models import WorkRecordExportJob


@admin.register(WorkRecordExportJob)
class WorkRecordExportJobAdmin(admin.ModelAdmin):
    list_display = ('id', 'export_format', 'status', 'requested_by', 'created_at')
    list_filter = ('status', 'export_format')
    readonly_fields = ('id', 'created_at', 'updated_at', 'completed_at')

