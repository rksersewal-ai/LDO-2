from rest_framework import serializers

from edms_api.models import Document, OcrJob


class DocumentSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source='name', read_only=True)
    document_number = serializers.CharField(source='id', read_only=True)
    file_type = serializers.CharField(source='type', read_only=True)

    class Meta:
        model = Document
        fields = [
            'id',
            'document_number',
            'name',
            'title',
            'description',
            'type',
            'file_type',
            'status',
            'revision',
            'size',
            'file',
            'file_hash',
            'ocr_status',
            'ocr_confidence',
            'extracted_text',
            'linked_pl',
            'category',
            'tags',
            'author',
            'date',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'file_hash']
        extra_kwargs = {'file': {'required': False, 'allow_null': True}}


class OcrJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = OcrJob
        fields = [
            'id',
            'document',
            'status',
            'started_at',
            'completed_at',
            'extracted_text',
            'confidence',
            'error_message',
            'created_by',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

