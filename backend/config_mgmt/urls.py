from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    BaselineViewSet,
    ChangeNoticeViewSet,
    ChangeRequestViewSet,
    PlBomLineViewSet,
    PlDocumentLinkViewSet,
    PlItemViewSet,
    SupervisorDocumentReviewViewSet,
)

router = DefaultRouter()
router.register(r'pl-items', PlItemViewSet, basename='pl-item')
router.register(r'pl-bom-lines', PlBomLineViewSet, basename='pl-bom-line')
router.register(r'pl-document-links', PlDocumentLinkViewSet, basename='pl-document-link')
router.register(r'supervisor-document-reviews', SupervisorDocumentReviewViewSet, basename='supervisor-document-review')
router.register(r'change-requests', ChangeRequestViewSet, basename='change-request')
router.register(r'change-notices', ChangeNoticeViewSet, basename='change-notice')
router.register(r'baselines', BaselineViewSet, basename='baseline')

urlpatterns = [
    path('', include(router.urls)),
]
