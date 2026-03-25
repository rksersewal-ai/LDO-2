"""
LDO-2 EDMS API Views
Django REST Framework viewsets and APIViews for all endpoints
"""

from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from django.contrib.auth import authenticate
from django.db.models import Q
from .models import Document, WorkRecord, PlItem, Case, OcrJob, Approval, AuditLog
from .serializers import (
    DocumentSerializer, WorkRecordSerializer, PlItemSerializer,
    CaseSerializer, OcrJobSerializer, ApprovalSerializer, AuditLogSerializer
)

# ─────────────────────────────────────────────────────────────────────────────
# Authentication Views
# ─────────────────────────────────────────────────────────────────────────────

class LoginView(APIView):
    """
    POST /api/auth/login/
    Authenticate user and return JWT tokens
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(username=username, password=password)
        if not user:
            return Response(
                {'detail': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        refresh = RefreshToken.for_user(user)
        group_names = list(user.groups.values_list('name', flat=True))
        resolved_role = group_names[0].lower() if group_names else 'viewer'
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': str(user.id),
                'username': user.username,
                'name': user.get_full_name() or user.username,
                'designation': getattr(user, 'designation', ''),
                'email': user.email,
                'role': getattr(user, 'role', resolved_role),
                'department': getattr(user, 'department', ''),
            }
        })

class LogoutView(APIView):
    """
    POST /api/auth/logout/
    Blacklist JWT token
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response({'detail': 'Logged out successfully'})
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'detail': 'Logged out successfully'})
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# ─────────────────────────────────────────────────────────────────────────────
# Document ViewSet
# ─────────────────────────────────────────────────────────────────────────────

class DocumentViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoints for documents
    GET /api/documents/ - List all
    POST /api/documents/ - Create
    GET /api/documents/{id}/ - Retrieve
    PATCH /api/documents/{id}/ - Update
    DELETE /api/documents/{id}/ - Delete
    POST /api/documents/{id}/versions/ - Upload new version
    """
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (JSONParser, MultiPartParser, FormParser)
    
    def get_queryset(self):
        queryset = Document.objects.all()
        
        # Filters
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        ocr_filter = self.request.query_params.get('ocr_status')
        if ocr_filter:
            queryset = queryset.filter(ocr_status=ocr_filter)
        
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(id__icontains=search) |
                Q(linked_pl__icontains=search)
            )
        
        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        document = serializer.save(author=self.request.user)
        if document.file:
            document.size = getattr(document.file, 'size', document.size)
            document.save(update_fields=['size'])
    
    @action(detail=True, methods=['post'], parser_classes=(MultiPartParser, FormParser))
    def versions(self, request, pk=None):
        """Upload a new version of the document"""
        document = self.get_object()
        file = request.FILES.get('file')
        
        if not file:
            return Response(
                {'error': 'No file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create new version (implementation depends on your model)
        new_version = document.create_version(file, request.user)
        
        return Response({
            'id': str(new_version.id),
            'revision': new_version.revision,
            'created_at': new_version.created_at,
        }, status=status.HTTP_201_CREATED)

# ─────────────────────────────────────────────────────────────────────────────
# Work Record ViewSet
# ─────────────────────────────────────────────────────────────────────────────

class WorkRecordViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoints for work records
    GET /api/work-records/ - List all
    POST /api/work-records/ - Create
    GET /api/work-records/{id}/ - Retrieve
    PATCH /api/work-records/{id}/ - Update
    DELETE /api/work-records/{id}/ - Delete
    """
    queryset = WorkRecord.objects.all()
    serializer_class = WorkRecordSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = WorkRecord.objects.all()
        
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(user_name_id=user_id)
        
        return queryset.order_by('-created_at')

# ─────────────────────────────────────────────────────────────────────────────
# PL Item ViewSet
# ─────────────────────────────────────────────────────────────────────────────

class PlItemViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoints for PL (Product/Locomotive) items
    """
    queryset = PlItem.objects.all()
    serializer_class = PlItemSerializer
    permission_classes = [IsAuthenticated]

# ─────────────────────────────────────────────────────────────────────────────
# Case ViewSet
# ─────────────────────────────────────────────────────────────────────────────

class CaseViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoints for discrepancy cases
    """
    queryset = Case.objects.all()
    serializer_class = CaseSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        """Close a case with resolution"""
        case = self.get_object()
        resolution = request.data.get('resolution')
        
        if not resolution:
            return Response(
                {'error': 'Resolution required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        case.status = 'Closed'
        case.resolution = resolution
        case.closed_at = timezone.now()
        case.save()
        
        return Response(CaseSerializer(case).data)

# ─────────────────────────────────────────────────────────────────────────────
# OCR ViewSet
# ─────────────────────────────────────────────────────────────────────────────

class OcrJobViewSet(viewsets.ModelViewSet):
    """
    Manage OCR extraction jobs
    """
    queryset = OcrJob.objects.all()
    serializer_class = OcrJobSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        """Start a new OCR job for a document"""
        document_id = request.data.get('document_id')
        
        try:
            document = Document.objects.get(id=document_id)
        except Document.DoesNotExist:
            return Response(
                {'error': 'Document not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        ocr_job, created = OcrJob.objects.update_or_create(
            document=document,
            defaults={
                'status': 'Queued',
                'created_by': request.user,
                'error_message': '',
            }
        )
        
        # Trigger async OCR task here (e.g., Celery)
        # from .tasks import extract_text_from_document
        # extract_text_from_document.delay(str(document.id))
        
        return Response(
            OcrJobSerializer(ocr_job).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )

class OcrResultView(APIView):
    """
    GET /api/ocr/results/{document_id}/
    Retrieve OCR extraction results for a document
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, document_id):
        try:
            document = Document.objects.get(id=document_id)
            ocr_result = OcrJob.objects.filter(document=document).first()
            
            return Response({
                'document_id': document_id,
                'status': ocr_result.status if ocr_result else 'Not Started',
                'text': ocr_result.extracted_text if ocr_result else '',
                'confidence': ocr_result.confidence if ocr_result else None,
                'extracted_at': ocr_result.created_at if ocr_result else None,
            })
        except Document.DoesNotExist:
            return Response(
                {'error': 'Document not found'},
                status=status.HTTP_404_NOT_FOUND
            )

# ─────────────────────────────────────────────────────────────────────────────
# Approval ViewSet
# ─────────────────────────────────────────────────────────────────────────────

class ApprovalViewSet(viewsets.ModelViewSet):
    """
    Manage approval workflows
    """
    queryset = Approval.objects.all()
    serializer_class = ApprovalSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a request"""
        approval = self.get_object()
        approval.status = 'Approved'
        approval.comment = request.data.get('comment', '')
        approval.approved_by = request.user
        approval.approved_at = timezone.now()
        approval.save()
        
        return Response(ApprovalSerializer(approval).data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a request"""
        approval = self.get_object()
        approval.status = 'Rejected'
        approval.rejection_reason = request.data.get('reason', '')
        approval.rejected_by = request.user
        approval.rejected_at = timezone.now()
        approval.save()
        
        return Response(ApprovalSerializer(approval).data)

# ─────────────────────────────────────────────────────────────────────────────
# Search & Audit
# ─────────────────────────────────────────────────────────────────────────────

class SearchView(APIView):
    """
    GET /api/search/?q=query&scope=DOCUMENTS
    Full-text search across documents, PL items, work records, and cases
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        query = request.query_params.get('q', '').strip()
        scope = request.query_params.get('scope', 'ALL')
        
        if not query or len(query) < 2:
            return Response({'error': 'Query too short'}, status=status.HTTP_400_BAD_REQUEST)
        
        results = {
            'documents': [],
            'work_records': [],
            'pl_items': [],
            'cases': [],
            'total': 0,
        }
        
        if scope in ['ALL', 'DOCUMENTS']:
            results['documents'] = DocumentSerializer(
                Document.objects.filter(Q(name__icontains=query) | Q(id__icontains=query))[:10],
                many=True
            ).data
        
        if scope in ['ALL', 'WORK']:
            results['work_records'] = WorkRecordSerializer(
                WorkRecord.objects.filter(Q(description__icontains=query) | Q(id__icontains=query))[:10],
                many=True
            ).data
        
        if scope in ['ALL', 'PL']:
            results['pl_items'] = PlItemSerializer(
                PlItem.objects.filter(Q(name__icontains=query) | Q(id__icontains=query))[:10],
                many=True
            ).data
        
        if scope in ['ALL', 'CASES']:
            results['cases'] = CaseSerializer(
                Case.objects.filter(Q(title__icontains=query) | Q(id__icontains=query))[:10],
                many=True
            ).data
        
        results['total'] = sum(len(v) for k, v in results.items() if k != 'total')
        
        return Response(results)

class SearchHistoryView(APIView):
    """
    GET /api/search/history/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        history = AuditLog.objects.filter(
            user=request.user,
            action='SEARCH'
        ).values('entity').distinct()[:20]

        return Response({'searches': list(history)})

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/audit/log/ - List all audit events
    GET /api/audit/log/{id}/ - Retrieve specific event
    """
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = AuditLog.objects.all()
        
        # Filters
        user = self.request.query_params.get('user')
        if user:
            queryset = queryset.filter(user__username=user)
        
        module = self.request.query_params.get('module')
        if module:
            queryset = queryset.filter(module=module)
        
        severity = self.request.query_params.get('severity')
        if severity:
            queryset = queryset.filter(severity=severity)
        
        date_from = self.request.query_params.get('date_from')
        if date_from:
            queryset = queryset.filter(created_at__gte=date_from)
        
        date_to = self.request.query_params.get('date_to')
        if date_to:
            queryset = queryset.filter(created_at__lte=date_to)
        
        return queryset.order_by('-created_at')

# ─────────────────────────────────────────────────────────────────────────────
# Health & Status
# ─────────────────────────────────────────────────────────────────────────────

class HealthStatusView(APIView):
    """
    GET /api/health/status/
    System health and status information
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        import os
        import psutil
        from django.db import connection
        
        # Check database
        try:
            connection.ensure_connection()
            db_status = 'OK'
        except Exception as e:
            db_status = f'Error: {str(e)}'
        
        # System metrics
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        return Response({
            'status': 'OK',
            'timestamp': timezone.now(),
            'services': {
                'database': db_status,
                'ocr': 'OK',
                'cache': 'OK',
            },
            'metrics': {
                'cpu_percent': cpu_percent,
                'memory_percent': memory.percent,
                'disk_percent': disk.percent,
            }
        })

class DashboardStatsView(APIView):
    """
    GET /api/dashboard/stats/
    Aggregated statistics for dashboard KPI cards
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return Response({
            'documents': {
                'total': Document.objects.count(),
                'approved': Document.objects.filter(status='Approved').count(),
                'in_review': Document.objects.filter(status='In Review').count(),
                'draft': Document.objects.filter(status='Draft').count(),
            },
            'work_records': {
                'total': WorkRecord.objects.count(),
                'open': WorkRecord.objects.filter(status='Open').count(),
                'in_progress': WorkRecord.objects.filter(status='In Progress').count(),
                'completed': WorkRecord.objects.filter(status='Completed').count(),
            },
            'approvals': {
                'pending': Approval.objects.filter(status='Pending').count(),
                'approved': Approval.objects.filter(status='Approved').count(),
                'rejected': Approval.objects.filter(status='Rejected').count(),
            },
            'cases': {
                'open': Case.objects.filter(status='Open').count(),
                'closed': Case.objects.filter(status='Closed').count(),
            }
        })

# ─────────────────────────────────────────────────────────────────────────────
# Import timezone for convenience
# ─────────────────────────────────────────────────────────────────────────────
from django.utils import timezone
