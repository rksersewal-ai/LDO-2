from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('edms.api_v1_urls')),
    path('api/', include('edms.legacy_api_urls')),
]
