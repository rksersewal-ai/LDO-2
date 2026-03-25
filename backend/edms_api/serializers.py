"""
LDO-2 EDMS Serializers
Django REST Framework serializers for all models
"""

from rest_framework import serializers
from .models import Document, WorkRecord, PlItem, Case, OcrJob, Approval, AuditLog

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = [
            'id', 'name', 'type', 'status', 'revision', 'size',
            'ocr_status', 'ocr_confidence', 'linked_pl', 'category',
            'author', 'date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class WorkRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkRecord
        fields = [
            'id', 'description', 'work_category', 'work_type', 'status',
            'date', 'pl_number', 'eoffice_number', 'drawing_number',
            'days_taken', 'target_days', 'user_name', 'verified_by',
            'remarks', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class PlItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlItem
        fields = [
            'id', 'name', 'description', 'part_number', 'status',
            'last_updated', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class CaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Case
        fields = [
            'id', 'title', 'description', 'severity', 'status',
            'pl_reference', 'opened_at', 'closed_at', 'assigned_to',
            'resolution', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class OcrJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = OcrJob
        fields = [
            'id', 'document', 'status', 'created_by',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class ApprovalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Approval
        fields = [
            'id', 'entity_type', 'entity_id', 'status',
            'requested_by', 'approved_by', 'rejected_by',
            'comment', 'rejection_reason', 'requested_at',
            'approved_at', 'rejected_at'
        ]
        read_only_fields = ['id', 'requested_at', 'approved_at', 'rejected_at']

class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = [
            'id', 'action', 'module', 'entity', 'user',
            'ip_address', 'severity', 'details', 'created_at'
        ]
        read_only_fields = fields
