from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import DocumentViewSet, OcrJobViewSet, OcrResultView

router = DefaultRouter()
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'ocr/jobs', OcrJobViewSet, basename='ocr-job')

urlpatterns = [
    path('', include(router.urls)),
    path('ocr/results/<str:document_id>/', OcrResultView.as_view(), name='ocr_result'),
]
