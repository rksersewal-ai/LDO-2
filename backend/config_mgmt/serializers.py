from rest_framework import serializers

from edms_api.models import (
    Baseline,
    BaselineItem,
    ChangeNotice,
    ChangeRequest,
    PlBomLine,
    PlDocumentLink,
    PlItem,
    SupervisorDocumentReview,
)


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


class BaselineItemSerializer(serializers.ModelSerializer):
    parent_pl_name = serializers.CharField(source='parent_pl.name', read_only=True)
    child_pl_name = serializers.CharField(source='child_pl.name', read_only=True)
    document_name = serializers.CharField(source='document.name', read_only=True)

    class Meta:
        model = BaselineItem
        fields = [
            'id',
            'baseline',
            'item_type',
            'source_object_id',
            'parent_pl',
            'parent_pl_name',
            'child_pl',
            'child_pl_name',
            'document',
            'document_name',
            'document_revision',
            'document_status',
            'link_role',
            'quantity',
            'unit_of_measure',
            'find_number',
            'line_order',
            'reference_designator',
            'remarks',
            'snapshot_payload',
            'created_at',
        ]
        read_only_fields = fields


class BaselineSerializer(serializers.ModelSerializer):
    pl_number = serializers.CharField(source='pl_item.id', read_only=True)
    pl_name = serializers.CharField(source='pl_item.name', read_only=True)
    source_change_request_title = serializers.CharField(source='source_change_request.title', read_only=True)
    source_change_notice_number = serializers.CharField(source='source_change_notice.notice_number', read_only=True)
    released_by_name = serializers.SerializerMethodField()
    item_count = serializers.SerializerMethodField()
    items = BaselineItemSerializer(many=True, read_only=True)

    class Meta:
        model = Baseline
        fields = [
            'id',
            'pl_item',
            'pl_number',
            'pl_name',
            'baseline_number',
            'title',
            'summary',
            'status',
            'source_change_request',
            'source_change_request_title',
            'source_change_notice',
            'source_change_notice_number',
            'impact_preview',
            'created_by',
            'released_by',
            'released_by_name',
            'superseded_by',
            'created_at',
            'released_at',
            'superseded_at',
            'updated_at',
            'item_count',
            'items',
        ]
        read_only_fields = [
            'id',
            'status',
            'created_at',
            'released_at',
            'superseded_at',
            'updated_at',
            'item_count',
            'items',
        ]

    def get_released_by_name(self, obj):
        if not obj.released_by:
            return ''
        return obj.released_by.get_full_name() or obj.released_by.username

    def get_item_count(self, obj):
        prefetched = getattr(obj, '_prefetched_objects_cache', {}).get('items')
        if prefetched is not None:
            return len(prefetched)
        return obj.items.count()


class ChangeRequestSerializer(serializers.ModelSerializer):
    pl_number = serializers.CharField(source='pl_item.id', read_only=True)
    pl_name = serializers.CharField(source='pl_item.name', read_only=True)
    requested_by_name = serializers.SerializerMethodField()
    reviewed_by_name = serializers.SerializerMethodField()
    baseline_number = serializers.CharField(source='source_baseline.baseline_number', read_only=True)

    class Meta:
        model = ChangeRequest
        fields = [
            'id',
            'pl_item',
            'pl_number',
            'pl_name',
            'title',
            'description',
            'impact_summary',
            'source_baseline',
            'baseline_number',
            'status',
            'requested_by',
            'requested_by_name',
            'reviewed_by',
            'reviewed_by_name',
            'release_notes',
            'decision_notes',
            'requested_at',
            'reviewed_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'status', 'requested_at', 'reviewed_at', 'updated_at']

    def get_requested_by_name(self, obj):
        if not obj.requested_by:
            return ''
        return obj.requested_by.get_full_name() or obj.requested_by.username

    def get_reviewed_by_name(self, obj):
        if not obj.reviewed_by:
            return ''
        return obj.reviewed_by.get_full_name() or obj.reviewed_by.username


class ChangeNoticeSerializer(serializers.ModelSerializer):
    change_request_title = serializers.CharField(source='change_request.title', read_only=True)
    change_request_status = serializers.CharField(source='change_request.status', read_only=True)
    issued_by_name = serializers.SerializerMethodField()
    approved_by_name = serializers.SerializerMethodField()
    released_by_name = serializers.SerializerMethodField()
    closed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = ChangeNotice
        fields = [
            'id',
            'change_request',
            'change_request_title',
            'change_request_status',
            'notice_number',
            'title',
            'summary',
            'effectivity_date',
            'status',
            'issued_by',
            'issued_by_name',
            'approved_by',
            'approved_by_name',
            'released_by',
            'released_by_name',
            'closed_by',
            'closed_by_name',
            'issued_at',
            'approved_at',
            'released_at',
            'closed_at',
            'decision_notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'status', 'issued_at', 'approved_at', 'released_at', 'closed_at', 'created_at', 'updated_at']

    def _username(self, user):
        if not user:
            return ''
        return user.get_full_name() or user.username

    def get_issued_by_name(self, obj):
        return self._username(obj.issued_by)

    def get_approved_by_name(self, obj):
        return self._username(obj.approved_by)

    def get_released_by_name(self, obj):
        return self._username(obj.released_by)

    def get_closed_by_name(self, obj):
        return self._username(obj.closed_by)


class PlItemSerializer(serializers.ModelSerializer):
    linked_document_ids = serializers.SerializerMethodField()
    linked_documents = PlDocumentLinkSerializer(source='document_links', many=True, read_only=True)
    used_in = serializers.SerializerMethodField()
    current_released_baseline_id = serializers.SerializerMethodField()
    current_released_baseline_number = serializers.SerializerMethodField()
    current_released_baseline_status = serializers.SerializerMethodField()

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
            'current_released_baseline_id',
            'current_released_baseline_number',
            'current_released_baseline_status',
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

    def get_current_released_baseline_id(self, obj):
        return str(obj.current_released_baseline_id or '')

    def get_current_released_baseline_number(self, obj):
        if not obj.current_released_baseline:
            return ''
        return obj.current_released_baseline.baseline_number

    def get_current_released_baseline_status(self, obj):
        if not obj.current_released_baseline:
            return ''
        return obj.current_released_baseline.status

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


class BomAddSerializer(serializers.Serializer):
    parent = serializers.CharField(required=True)
    child = serializers.CharField(required=True)
    quantity = serializers.DecimalField(max_digits=12, decimal_places=3, required=False, default=1)
    unit_of_measure = serializers.CharField(required=False, default='EA')
    find_number = serializers.CharField(required=True)
    line_order = serializers.IntegerField(required=False, min_value=0, default=0)
    reference_designator = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    remarks = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class BomReplaceSerializer(serializers.Serializer):
    child = serializers.CharField(required=True)
    quantity = serializers.DecimalField(max_digits=12, decimal_places=3, required=False)
    unit_of_measure = serializers.CharField(required=False)
    reference_designator = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    remarks = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class BomReorderSerializer(serializers.Serializer):
    items = serializers.ListField(child=serializers.DictField(), allow_empty=False)


class BomCompareSerializer(serializers.Serializer):
    left = serializers.CharField(required=True)
    right = serializers.CharField(required=True)


class BomImpactPreviewSerializer(serializers.Serializer):
    baseline = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    parent = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    child = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    child_replacement = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    unit_of_measure = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    quantity = serializers.DecimalField(max_digits=12, decimal_places=3, required=False)
    find_number = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    line_order = serializers.IntegerField(required=False, min_value=0)
    reference_designator = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    remarks = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class ChangeRequestDecisionSerializer(serializers.Serializer):
    notes = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    impact_summary = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class ChangeNoticeDecisionSerializer(serializers.Serializer):
    notes = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    effectivity_date = serializers.DateField(required=False, allow_null=True)


class BaselineReleaseSerializer(serializers.Serializer):
    title = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    summary = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    change_request = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    change_notice = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    baseline_number = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class SupervisorDocumentReviewSerializer(serializers.ModelSerializer):
    pl_number = serializers.CharField(source='pl_item.id', read_only=True)
    pl_name = serializers.CharField(source='pl_item.name', read_only=True)
    latest_document_id = serializers.CharField(source='latest_document.id', read_only=True)
    latest_document_name = serializers.CharField(source='latest_document.name', read_only=True)
    latest_document_status = serializers.CharField(source='latest_document.status', read_only=True)
    latest_document_type = serializers.CharField(source='latest_document.type', read_only=True)
    previous_document_id = serializers.CharField(source='previous_document.id', read_only=True, allow_null=True)
    previous_document_name = serializers.CharField(source='previous_document.name', read_only=True, allow_null=True)
    previous_document_status = serializers.CharField(source='previous_document.status', read_only=True, allow_null=True)
    previous_document_type = serializers.CharField(source='previous_document.type', read_only=True, allow_null=True)

    class Meta:
        model = SupervisorDocumentReview
        fields = [
            'id',
            'status',
            'pl_item',
            'pl_number',
            'pl_name',
            'design_supervisor',
            'latest_document',
            'latest_document_id',
            'latest_document_name',
            'latest_document_status',
            'latest_document_type',
            'latest_revision',
            'previous_document',
            'previous_document_id',
            'previous_document_name',
            'previous_document_status',
            'previous_document_type',
            'previous_revision',
            'document_family_key',
            'change_summary',
            'requested_by',
            'resolved_by',
            'resolution_notes',
            'bypass_reason',
            'created_at',
            'updated_at',
            'resolved_at',
        ]
        read_only_fields = fields


class SupervisorDocumentReviewDecisionSerializer(serializers.Serializer):
    notes = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    bypass_reason = serializers.CharField(required=False, allow_blank=True, allow_null=True)
