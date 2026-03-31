"""
Compatibility view façade.

The active implementations live in the modular apps:
- shared
- documents
- config_mgmt
- work

This module re-exports the public view classes so older imports keep working
while the backend internally follows the modular-monolith layout.
"""

from config_mgmt.views import (
    BaselineViewSet,
    ChangeNoticeViewSet,
    ChangeRequestViewSet,
    PlBomLineViewSet,
    PlDocumentLinkViewSet,
    PlItemViewSet,
)
from documents.views import DocumentViewSet, OcrJobViewSet, OcrResultView
from shared.views import (
    AuditLogViewSet,
    DashboardStatsView,
    HealthStatusView,
    LoginView,
    LogoutView,
    SearchHistoryView,
    SearchView,
)
from work.views import ApprovalViewSet, CaseViewSet, WorkRecordExportJobCreateView, WorkRecordViewSet

__all__ = [
    'ApprovalViewSet',
    'AuditLogViewSet',
    'BaselineViewSet',
    'CaseViewSet',
    'DashboardStatsView',
    'DocumentViewSet',
    'HealthStatusView',
    'LoginView',
    'LogoutView',
    'ChangeNoticeViewSet',
    'ChangeRequestViewSet',
    'OcrJobViewSet',
    'OcrResultView',
    'PlBomLineViewSet',
    'PlDocumentLinkViewSet',
    'PlItemViewSet',
    'SearchHistoryView',
    'SearchView',
    'WorkRecordExportJobCreateView',
    'WorkRecordViewSet',
]
