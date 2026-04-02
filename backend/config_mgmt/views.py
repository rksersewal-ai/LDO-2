from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from edms_api.models import Baseline, ChangeNotice, ChangeRequest, PlBomLine, PlDocumentLink, PlItem, SupervisorDocumentReview
from shared.permissions import PermissionService

from .serializers import (
    BaselineReleaseSerializer,
    BaselineSerializer,
    BomAddSerializer,
    BomCompareSerializer,
    BomImpactPreviewSerializer,
    BomMoveSerializer,
    BomReorderSerializer,
    BomReplaceSerializer,
    ChangeNoticeDecisionSerializer,
    ChangeNoticeSerializer,
    ChangeRequestDecisionSerializer,
    ChangeRequestSerializer,
    PlBomLineSerializer,
    PlDocumentLinkCreateSerializer,
    PlDocumentLinkSerializer,
    PlItemSerializer,
    SupervisorDocumentReviewDecisionSerializer,
    SupervisorDocumentReviewSerializer,
)
from .services import (
    BaselineService,
    BomService,
    ChangeNoticeService,
    ChangeRequestService,
    PlItemService,
    SupervisorDocumentReviewService,
)


class PlItemViewSet(viewsets.ModelViewSet):
    queryset = PlItem.objects.all()
    serializer_class = PlItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PlItemService.queryset(self.request.query_params, self.request.user)

    def perform_create(self, serializer):
        pl_item = serializer.save()
        PermissionService.grant_default_object_permissions(pl_item, self.request.user)

    @action(detail=True, methods=['get'])
    def documents(self, request, pk=None):
        links = PlItemService.linked_documents(self.get_object())
        return Response(PlDocumentLinkSerializer(links, many=True).data)

    @action(detail=True, methods=['post'], url_path='documents/set')
    def set_documents(self, request, pk=None):
        document_ids = request.data.get('document_ids', [])
        if not isinstance(document_ids, list):
            return Response({'detail': 'document_ids must be a list'}, status=status.HTTP_400_BAD_REQUEST)
        pl_item = PlItemService.set_documents(self.get_object(), document_ids, request)
        return Response(self.get_serializer(pl_item).data)

    @action(detail=True, methods=['post'], url_path='documents/link')
    def link_document(self, request, pk=None):
        serializer = PlDocumentLinkCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        link = PlItemService.link_document(
            self.get_object(),
            serializer.validated_data['document_id'],
            serializer.validated_data.get('link_role'),
            serializer.validated_data.get('notes'),
            request,
        )
        return Response(PlDocumentLinkSerializer(link).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'], url_path='bom-tree')
    def bom_tree(self, request, pk=None):
        try:
            max_depth = min(max(int(request.query_params.get('max_depth', 50)), 1), 50)
        except ValueError:
            return Response({'detail': 'max_depth must be an integer'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(PlItemService.bom_tree(self.get_object(), max_depth))

    @action(detail=True, methods=['get'], url_path='where-used')
    def where_used(self, request, pk=None):
        return Response(PlItemService.where_used(self.get_object()))

    @action(detail=True, methods=['get'], url_path='baselines')
    def baselines(self, request, pk=None):
        baseline_qs = PlItemService.baselines(self.get_object())
        return Response(BaselineSerializer(baseline_qs, many=True).data)

    @action(detail=True, methods=['post'], url_path='baselines/release')
    def release_baseline(self, request, pk=None):
        serializer = BaselineReleaseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data
        pl_item = self.get_object()
        change_request = None
        change_notice = None
        if payload.get('change_request'):
            change_request = get_object_or_404(ChangeRequest, pk=payload['change_request'], pl_item=pl_item)
        if payload.get('change_notice'):
            change_notice = get_object_or_404(ChangeNotice, pk=payload['change_notice'], change_request__pl_item=pl_item)
        baseline = BaselineService.release(
            pl_item,
            request=request,
            title=payload.get('title'),
            summary=payload.get('summary'),
            baseline_number=payload.get('baseline_number'),
            change_request=change_request,
            change_notice=change_notice,
        )
        return Response(BaselineSerializer(baseline).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='bom/lines')
    def add_bom_line(self, request, pk=None):
        serializer = BomAddSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data
        pl_item = self.get_object()
        parent = get_object_or_404(PlItem, pk=payload.get('parent') or pl_item.pk)
        child = get_object_or_404(PlItem, pk=payload['child'])
        line = BomService.add(
            parent,
            child,
            quantity=payload.get('quantity', 1),
            unit_of_measure=payload.get('unit_of_measure', 'EA'),
            find_number=payload['find_number'],
            line_order=payload.get('line_order', 0),
            reference_designator=payload.get('reference_designator'),
            remarks=payload.get('remarks'),
            request=request,
        )
        return Response(PlBomLineSerializer(line).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='bom/reorder')
    def reorder_bom_lines(self, request, pk=None):
        serializer = BomReorderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        lines = BomService.reorder(self.get_object(), serializer.validated_data['items'], request=request)
        return Response(PlBomLineSerializer(lines, many=True).data)

    @action(detail=True, methods=['post'], url_path='bom/compare')
    def compare_baselines(self, request, pk=None):
        serializer = BomCompareSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        left = get_object_or_404(Baseline, pk=serializer.validated_data['left'], pl_item=self.get_object())
        right = get_object_or_404(Baseline, pk=serializer.validated_data['right'], pl_item=self.get_object())
        return Response(BaselineService.compare(left, right))

    @action(detail=True, methods=['post'], url_path='bom/impact-preview')
    def impact_preview(self, request, pk=None):
        serializer = BomImpactPreviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(BomService.impact_preview(self.get_object(), serializer.validated_data, request=request))


class PlDocumentLinkViewSet(viewsets.ModelViewSet):
    queryset = PlDocumentLink.objects.select_related('pl_item', 'document').all()
    serializer_class = PlDocumentLinkSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'patch', 'delete']

    def get_queryset(self):
        return PermissionService.scope_queryset(
            super().get_queryset(),
            self.request.user,
            'view_pldocumentlink',
        )

    def perform_destroy(self, instance):
        PlItemService.unlink_document(instance, self.request)


class PlBomLineViewSet(viewsets.ModelViewSet):
    queryset = PlBomLine.objects.select_related('parent', 'child').all()
    serializer_class = PlBomLineSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = PermissionService.scope_queryset(super().get_queryset(), self.request.user, 'view_plbomline')
        parent = self.request.query_params.get('parent')
        if parent:
            queryset = queryset.filter(parent_id=parent)
        child = self.request.query_params.get('child')
        if child:
            queryset = queryset.filter(child_id=child)
        return queryset

    def perform_create(self, serializer):
        BomService.create(serializer, self.request)

    def perform_update(self, serializer):
        BomService.update(serializer, self.request)

    def perform_destroy(self, instance):
        BomService.delete(instance, self.request)

    @action(detail=True, methods=['post'])
    def move(self, request, pk=None):
        serializer = BomMoveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        line = BomService.move(self.get_object(), request=request, **serializer.validated_data)
        return Response(self.get_serializer(line).data)

    @action(detail=True, methods=['post'])
    def replace(self, request, pk=None):
        serializer = BomReplaceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data
        line = BomService.replace(
            self.get_object(),
            child=get_object_or_404(PlItem, pk=payload['child']) if payload.get('child') else None,
            quantity=payload.get('quantity'),
            unit_of_measure=payload.get('unit_of_measure'),
            reference_designator=payload.get('reference_designator'),
            remarks=payload.get('remarks'),
            request=request,
        )
        return Response(self.get_serializer(line).data)

    @action(detail=True, methods=['post'])
    def remove(self, request, pk=None):
        line = self.get_object()
        BomService.delete(line, request)
        return Response(status=status.HTTP_204_NO_CONTENT)


class ChangeRequestViewSet(viewsets.ModelViewSet):
    queryset = ChangeRequest.objects.select_related('pl_item', 'requested_by', 'reviewed_by', 'source_baseline').all()
    serializer_class = ChangeRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = ChangeRequestService.queryset(self.request.user)
        pl_item = self.request.query_params.get('pl_item')
        if pl_item:
            queryset = queryset.filter(pl_item_id=pl_item)
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset

    def perform_create(self, serializer):
        ChangeRequestService.create(serializer, self.request)

    @action(detail=True, methods=['get'], url_path='available-actions')
    def available_actions(self, request, pk=None):
        return Response({'actions': ChangeRequestService.available_actions(self.get_object(), request.user)})

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        change_request = ChangeRequestService.submit(self.get_object(), request)
        return Response(self.get_serializer(change_request).data)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        serializer = ChangeRequestDecisionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        change_request = ChangeRequestService.approve(self.get_object(), request, notes=serializer.validated_data.get('notes') or '')
        return Response(self.get_serializer(change_request).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        serializer = ChangeRequestDecisionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        change_request = ChangeRequestService.reject(self.get_object(), request, notes=serializer.validated_data.get('notes') or '')
        return Response(self.get_serializer(change_request).data)

    @action(detail=True, methods=['post'])
    def implement(self, request, pk=None):
        change_request = ChangeRequestService.implement(self.get_object(), request)
        return Response(self.get_serializer(change_request).data)


class ChangeNoticeViewSet(viewsets.ModelViewSet):
    queryset = ChangeNotice.objects.select_related('change_request', 'issued_by', 'approved_by', 'released_by', 'closed_by').all()
    serializer_class = ChangeNoticeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = ChangeNoticeService.queryset(self.request.user)
        change_request = self.request.query_params.get('change_request')
        if change_request:
            queryset = queryset.filter(change_request_id=change_request)
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset

    def perform_create(self, serializer):
        ChangeNoticeService.create(serializer, self.request)

    @action(detail=True, methods=['get'], url_path='available-actions')
    def available_actions(self, request, pk=None):
        return Response({'actions': ChangeNoticeService.available_actions(self.get_object(), request.user)})

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        serializer = ChangeNoticeDecisionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        change_notice = ChangeNoticeService.approve(self.get_object(), request, notes=serializer.validated_data.get('notes') or '')
        return Response(self.get_serializer(change_notice).data)

    @action(detail=True, methods=['post'])
    def release(self, request, pk=None):
        serializer = ChangeNoticeDecisionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        change_notice = ChangeNoticeService.release(
            self.get_object(),
            request,
            notes=serializer.validated_data.get('notes') or '',
            effectivity_date=serializer.validated_data.get('effectivity_date'),
        )
        return Response(self.get_serializer(change_notice).data)

    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        serializer = ChangeNoticeDecisionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        change_notice = ChangeNoticeService.close(self.get_object(), request, notes=serializer.validated_data.get('notes') or '')
        return Response(self.get_serializer(change_notice).data)


class BaselineViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Baseline.objects.select_related(
        'pl_item',
        'created_by',
        'released_by',
        'source_change_request',
        'source_change_notice',
        'superseded_by',
    ).prefetch_related('items__document', 'items__parent_pl', 'items__child_pl').all()
    serializer_class = BaselineSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = PermissionService.scope_queryset(super().get_queryset(), self.request.user, 'view_baseline')
        pl_item = self.request.query_params.get('pl_item')
        if pl_item:
            queryset = queryset.filter(pl_item_id=pl_item)
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset

    @action(detail=False, methods=['get'])
    def compare(self, request):
        left_id = request.query_params.get('left')
        right_id = request.query_params.get('right')
        if not left_id or not right_id:
            return Response({'detail': 'left and right baseline ids are required'}, status=status.HTTP_400_BAD_REQUEST)
        left = get_object_or_404(Baseline, pk=left_id)
        right = get_object_or_404(Baseline, pk=right_id)
        if left.pl_item_id != right.pl_item_id:
            return Response({'detail': 'Baselines must belong to the same PL item.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(BaselineService.compare(left, right))


class SupervisorDocumentReviewViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SupervisorDocumentReview.objects.select_related(
        'pl_item',
        'latest_document',
        'previous_document',
        'requested_by',
        'resolved_by',
    ).all()
    serializer_class = SupervisorDocumentReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = SupervisorDocumentReviewService.visible_reviews_for_user(self.request.user)
        pl_item = self.request.query_params.get('pl_item')
        if pl_item:
            queryset = queryset.filter(pl_item_id=pl_item)
        document = self.request.query_params.get('document')
        if document:
            queryset = queryset.filter(latest_document_id=document)
        return queryset

    @action(detail=True, methods=['get'], url_path='available-actions')
    def available_actions(self, request, pk=None):
        return Response({'actions': SupervisorDocumentReviewService.available_actions(self.get_object(), request.user)})

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        serializer = SupervisorDocumentReviewDecisionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        review = SupervisorDocumentReviewService.approve(
            self.get_object(),
            user=request.user,
            notes=serializer.validated_data.get('notes') or '',
            request=request,
        )
        return Response(self.get_serializer(review).data)

    @action(detail=True, methods=['post'])
    def bypass(self, request, pk=None):
        serializer = SupervisorDocumentReviewDecisionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        review = SupervisorDocumentReviewService.bypass(
            self.get_object(),
            user=request.user,
            notes=serializer.validated_data.get('notes') or '',
            bypass_reason=serializer.validated_data.get('bypass_reason') or '',
            request=request,
        )
        return Response(self.get_serializer(review).data)
