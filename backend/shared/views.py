from django.conf import settings
from django.contrib.auth import authenticate
from django.db import connection
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from edms_api.throttles import HealthRateThrottle, LoginRateThrottle
from edms_api.models import AuditLog

from .serializers import AuditLogSerializer
from .services import AuditService, DashboardService, SearchService


def resolve_user_role(user):
    group_names = list(user.groups.values_list('name', flat=True))
    explicit_role = getattr(user, 'role', None)
    if explicit_role:
        return explicit_role
    if group_names:
        return group_names[0].lower()
    if user.is_superuser or user.is_staff:
        return 'admin'
    return 'viewer'


def serialize_user(user):
    return {
        'id': str(user.id),
        'username': user.username,
        'name': user.get_full_name() or user.username,
        'designation': getattr(user, 'designation', ''),
        'email': user.email,
        'role': resolve_user_role(user),
        'department': getattr(user, 'department', ''),
    }


class LoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [LoginRateThrottle]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if not user:
            return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        AuditService.log(
            'LOGIN',
            'System',
            user=user,
            entity=user.username,
            details={'correlation_id': getattr(request, 'correlation_id', '')},
            ip_address=request.META.get('REMOTE_ADDR'),
        )
        return Response({'access': str(refresh.access_token), 'refresh': str(refresh), 'user': serialize_user(user)})


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        AuditService.log(
            'LOGOUT',
            'System',
            user=request.user,
            entity=request.user.username,
            details={'correlation_id': getattr(request, 'correlation_id', '')},
            ip_address=request.META.get('REMOTE_ADDR'),
        )
        return Response({'detail': 'Logged out successfully'})


class SearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        scope = request.query_params.get('scope', 'ALL')
        if len(query) < 2:
            return Response({'detail': 'Query too short'}, status=status.HTTP_400_BAD_REQUEST)
        AuditService.log(
            'SEARCH',
            'System',
            user=request.user,
            entity=query,
            details={'scope': scope},
            ip_address=request.META.get('REMOTE_ADDR'),
        )
        return Response(SearchService.search(query, scope))


class SearchHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({'searches': SearchService.history_for_user(request.user)})


class HealthStatusView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [HealthRateThrottle]

    def get(self, request):
        import psutil

        try:
            connection.ensure_connection()
            with connection.cursor() as cursor:
                cursor.execute('SELECT 1')
                cursor.fetchone()
            db_status = 'OK'
        except Exception as exc:  # pragma: no cover
            db_status = f'Error: {exc}'

        cpu_percent = psutil.cpu_percent(interval=None)
        memory = psutil.virtual_memory()
        disk_root = settings.BASE_DIR.anchor or str(settings.BASE_DIR)
        disk = psutil.disk_usage(disk_root)
        return Response(
            {
                'status': 'OK',
                'timestamp': timezone.now(),
                'services': {'database': db_status, 'ocr': 'OK', 'cache': 'OK'},
                'metrics': {
                    'cpu_percent': cpu_percent,
                    'memory_percent': memory.percent,
                    'disk_percent': disk.percent,
                },
            }
        )


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(DashboardService.stats())


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
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
