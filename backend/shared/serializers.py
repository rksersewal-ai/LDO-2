from rest_framework import serializers

from edms_api.models import AuditLog
from shared.models import ReportJob


class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = [
            'id',
            'action',
            'module',
            'entity',
            'user',
            'ip_address',
            'severity',
            'details',
            'created_at',
        ]
        read_only_fields = fields


class WorkflowActionSerializer(serializers.Serializer):
    action = serializers.CharField(max_length=50)
    notes = serializers.CharField(required=False, allow_blank=True, default='')
    comment = serializers.CharField(required=False, allow_blank=True, default='')
    reason = serializers.CharField(required=False, allow_blank=True, default='')
    bypass_reason = serializers.CharField(required=False, allow_blank=True, default='')
    effectivity_date = serializers.DateField(required=False, allow_null=True)


class ReportJobCreateSerializer(serializers.Serializer):
    report_type = serializers.CharField(max_length=120)
    format = serializers.ChoiceField(choices=ReportJob.FORMAT_CHOICES, default='xlsx')
    filters = serializers.JSONField(required=False)
    parameters = serializers.JSONField(required=False)


class ReportJobSerializer(serializers.ModelSerializer):
    requested_by_name = serializers.SerializerMethodField()
    can_retry = serializers.SerializerMethodField()
    download_ready = serializers.SerializerMethodField()

    class Meta:
        model = ReportJob
        fields = [
            'id',
            'report_type',
            'export_format',
            'filters',
            'parameters',
            'status',
            'requested_by',
            'requested_by_name',
            'can_retry',
            'download_ready',
            'file_key',
            'correlation_id',
            'result_summary',
            'error_message',
            'created_at',
            'started_at',
            'completed_at',
            'updated_at',
        ]
        read_only_fields = fields

    def get_requested_by_name(self, obj):
        if not obj.requested_by:
            return ''
        return obj.requested_by.get_full_name() or obj.requested_by.username

    def get_can_retry(self, obj):
        return obj.status == 'FAILED'

    def get_download_ready(self, obj):
        return obj.status == 'COMPLETED' and bool(obj.file_key)
