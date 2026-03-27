from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ApprovalViewSet, CaseViewSet, WorkRecordExportJobCreateView, WorkRecordViewSet

router = DefaultRouter()
router.register(r'work-records', WorkRecordViewSet, basename='work-record')
router.register(r'approvals', ApprovalViewSet, basename='approval')
router.register(r'cases', CaseViewSet, basename='case')

urlpatterns = [
    path('work-records/export-jobs/', WorkRecordExportJobCreateView.as_view(), name='work-record-export-jobs'),
    path('', include(router.urls)),
]
