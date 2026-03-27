from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from edms_api.models import Approval, Case, WorkRecord

from .serializers import (
    ApprovalSerializer,
    CaseSerializer,
    WorkRecordExportJobSerializer,
    WorkRecordExportRequestSerializer,
    WorkRecordSerializer,
)
from .services import ApprovalService, CaseService, WorkRecordService


class WorkRecordViewSet(viewsets.ModelViewSet):
    queryset = WorkRecord.objects.all()
    serializer_class = WorkRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WorkRecordService.queryset(self.request.query_params)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = WorkRecordService.create(serializer.validated_data, request)
        output = self.get_serializer(instance)
        return Response(output.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance=instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        updated = WorkRecordService.update(instance, serializer.validated_data, request)
        return Response(self.get_serializer(updated).data)

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)


class WorkRecordExportJobCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = WorkRecordExportRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        job = WorkRecordService.create_export_job(request, serializer.validated_data['format'], serializer.validated_data.get('filters', {}))
        return Response(WorkRecordExportJobSerializer(job).data, status=status.HTTP_202_ACCEPTED)


class ApprovalViewSet(viewsets.ModelViewSet):
    queryset = Approval.objects.all()
    serializer_class = ApprovalSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        approval = ApprovalService.approve(self.get_object(), request, request.data.get('comment', ''))
        return Response(self.get_serializer(approval).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        approval = ApprovalService.reject(self.get_object(), request, request.data.get('reason', ''))
        return Response(self.get_serializer(approval).data)


class CaseViewSet(viewsets.ModelViewSet):
    queryset = Case.objects.all()
    serializer_class = CaseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CaseService.queryset()

    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        resolution = request.data.get('resolution')
        if not resolution:
            return Response({'detail': 'Resolution required'}, status=status.HTTP_400_BAD_REQUEST)
        case = CaseService.close(self.get_object(), request, resolution)
        return Response(self.get_serializer(case).data)

