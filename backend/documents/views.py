from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from edms_api.models import Document, OcrJob

from .serializers import DocumentSerializer, OcrJobSerializer
from .services import DocumentService, OcrApplicationService


class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (JSONParser, MultiPartParser, FormParser)

    def get_queryset(self):
        return DocumentService.queryset(self.request.query_params)

    def perform_create(self, serializer):
        DocumentService.create(serializer, self.request.user, self.request)

    @action(detail=True, methods=['post'], parser_classes=(MultiPartParser, FormParser))
    def versions(self, request, pk=None):
        document = self.get_object()
        file = request.FILES.get('file')
        if not file:
            return Response({'detail': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        version = DocumentService.create_version(document, file, request.user, request)
        return Response(
            {'id': str(version.id), 'revision': version.revision, 'created_at': version.created_at},
            status=status.HTTP_201_CREATED,
        )


class OcrJobViewSet(viewsets.ModelViewSet):
    queryset = OcrJob.objects.all()
    serializer_class = OcrJobSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        document_id = request.data.get('document_id')
        if not document_id:
            return Response({'detail': 'document_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        ocr_job, created = OcrApplicationService.start_job(document_id, request.user, request)
        return Response(
            OcrJobSerializer(ocr_job).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class OcrResultView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, document_id):
        return Response(OcrApplicationService.result_for_document(document_id))

