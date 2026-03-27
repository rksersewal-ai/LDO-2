from rest_framework import serializers

from edms_api.models import AuditLog


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

