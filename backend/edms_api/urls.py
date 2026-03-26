"""
LDO-2 EDMS API URLs
Django REST Framework routing for all backend endpoints
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    # Auth
    LoginView, LogoutView,
    # Documents
    DocumentViewSet,
    # Work Records
    WorkRecordViewSet,
    # PL Items
    PlBomLineViewSet, PlItemViewSet,
    # Cases
    CaseViewSet,
    # OCR
    OcrJobViewSet, OcrResultView,
    # Approvals
    ApprovalViewSet,
    # Search & Audit
    SearchView, SearchHistoryView, AuditLogViewSet,
    # Health
    HealthStatusView, DashboardStatsView,
)

# DRF Router
router = DefaultRouter()
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'work-records', WorkRecordViewSet, basename='work-record')
router.register(r'pl-items', PlItemViewSet, basename='pl-item')
router.register(r'pl-bom-lines', PlBomLineViewSet, basename='pl-bom-line')
router.register(r'cases', CaseViewSet, basename='case')
router.register(r'ocr/jobs', OcrJobViewSet, basename='ocr-job')
router.register(r'approvals', ApprovalViewSet, basename='approval')
router.register(r'audit/log', AuditLogViewSet, basename='audit-log')

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # Auth Endpoints
    path('api/auth/login/', LoginView.as_view(), name='login'),
    path('api/auth/logout/', LogoutView.as_view(), name='logout'),
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # DRF Router endpoints (prefixed with /api/)
    path('api/', include(router.urls)),
    
    # Search
    path('api/search/', SearchView.as_view(), name='search'),
    path('api/search/history/', SearchHistoryView.as_view(), name='search_history'),
    
    # OCR Results
    path('api/ocr/results/<str:document_id>/', OcrResultView.as_view(), name='ocr_result'),
    
    # Health & Status
    path('api/health/status/', HealthStatusView.as_view(), name='health_status'),
    path('api/dashboard/stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
    
    # DRF Authentication URLs
    path('api/auth/', include('rest_framework.urls')),
]
