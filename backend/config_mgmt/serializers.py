from rest_framework import serializers

from edms_api.models import PlBomLine, PlDocumentLink, PlItem


class PlDocumentLinkSerializer(serializers.ModelSerializer):
    document_id = serializers.CharField(source='document.id', read_only=True)
    name = serializers.CharField(source='document.name', read_only=True)
    description = serializers.CharField(source='document.description', read_only=True)
    type = serializers.CharField(source='document.type', read_only=True)
    status = serializers.CharField(source='document.status', read_only=True)
    revision = serializers.IntegerField(source='document.revision', read_only=True)
    category = serializers.CharField(source='document.category', read_only=True)
    size = serializers.IntegerField(source='document.size', read_only=True)
    date = serializers.DateField(source='document.date', read_only=True)
    file = serializers.FileField(source='document.file', read_only=True)

    class Meta:
        model = PlDocumentLink
        fields = [
            'id',
            'pl_item',
            'document',
            'document_id',
            'name',
            'description',
            'type',
            'status',
            'revision',
            'category',
            'size',
            'date',
            'file',
            'link_role',
            'notes',
            'linked_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'linked_at', 'updated_at']


class PlBomLineSerializer(serializers.ModelSerializer):
    parent_name = serializers.CharField(source='parent.name', read_only=True)
    child_name = serializers.CharField(source='child.name', read_only=True)

    class Meta:
        model = PlBomLine
        fields = [
            'id',
            'parent',
            'parent_name',
            'child',
            'child_name',
            'quantity',
            'unit_of_measure',
            'find_number',
            'line_order',
            'reference_designator',
            'remarks',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PlItemSerializer(serializers.ModelSerializer):
    linked_document_ids = serializers.SerializerMethodField()
    linked_documents = PlDocumentLinkSerializer(source='document_links', many=True, read_only=True)
    used_in = serializers.SerializerMethodField()

    class Meta:
        model = PlItem
        fields = [
            'id',
            'name',
            'description',
            'part_number',
            'status',
            'category',
            'controlling_agency',
            'safety_critical',
            'safety_classification',
            'severity_of_failure',
            'consequences',
            'functionality',
            'application_area',
            'used_in',
            'drawing_numbers',
            'spec_numbers',
            'mother_part',
            'uvam_item_id',
            'str_number',
            'eligibility_criteria',
            'procurement_conditions',
            'design_supervisor',
            'concerned_supervisor',
            'eoffice_file',
            'vendor_type',
            'recent_activity',
            'engineering_changes',
            'linked_document_ids',
            'linked_documents',
            'linked_work_ids',
            'linked_case_ids',
            'manufacturer',
            'specifications',
            'last_updated',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def get_linked_document_ids(self, obj):
        prefetched_links = getattr(obj, '_prefetched_objects_cache', {}).get('document_links')
        if prefetched_links is not None:
            return [link.document_id for link in prefetched_links]
        return list(obj.document_links.values_list('document_id', flat=True))

    def get_used_in(self, obj):
        prefetched_bom_parents = getattr(obj, '_prefetched_objects_cache', {}).get('bom_parents')
        if prefetched_bom_parents is not None:
            bom_parent_ids = sorted({line.parent_id for line in prefetched_bom_parents})
        else:
            bom_parent_ids = list(obj.bom_parents.values_list('parent_id', flat=True).distinct())
        if bom_parent_ids:
            return bom_parent_ids
        return obj.used_in or []

    def validate(self, attrs):
        vendor_type = attrs.get('vendor_type', getattr(self.instance, 'vendor_type', None))
        uvam_item_id = attrs.get('uvam_item_id', getattr(self.instance, 'uvam_item_id', None))
        if vendor_type == 'VD' and not (uvam_item_id or '').strip():
            raise serializers.ValidationError({'uvam_item_id': 'UVAM item ID is required for vendor directory items.'})
        return attrs


class PlDocumentLinkCreateSerializer(serializers.Serializer):
    document_id = serializers.CharField()
    link_role = serializers.ChoiceField(choices=PlDocumentLink.ROLE_CHOICES, default='GENERAL')
    notes = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class BomMoveSerializer(serializers.Serializer):
    parent = serializers.CharField(required=False)
    line_order = serializers.IntegerField(required=False, min_value=0)
    find_number = serializers.CharField(required=False)

