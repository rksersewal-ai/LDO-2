from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from edms_api.models import PlBomLine, PlDocumentLink, PlItem

from .serializers import (
    BomMoveSerializer,
    PlBomLineSerializer,
    PlDocumentLinkCreateSerializer,
    PlDocumentLinkSerializer,
    PlItemSerializer,
)
from .services import BomService, PlItemService


class PlItemViewSet(viewsets.ModelViewSet):
    queryset = PlItem.objects.all()
    serializer_class = PlItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PlItemService.queryset(self.request.query_params)

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


class PlDocumentLinkViewSet(viewsets.ModelViewSet):
    queryset = PlDocumentLink.objects.select_related('pl_item', 'document').all()
    serializer_class = PlDocumentLinkSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'patch', 'delete']

    def perform_destroy(self, instance):
        PlItemService.unlink_document(instance, self.request)


class PlBomLineViewSet(viewsets.ModelViewSet):
    queryset = PlBomLine.objects.select_related('parent', 'child').all()
    serializer_class = PlBomLineSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
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

