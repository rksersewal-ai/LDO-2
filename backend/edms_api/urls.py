"""
Compatibility URL façade for legacy imports.

The active routing now lives in the modular apps under `edms.api_v1_urls`
and `edms.legacy_api_urls`. This module stays in place so older imports of
`edms_api.urls` continue to resolve to the same public API surface.
"""

from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('edms.api_v1_urls')),
    path('api/', include('edms.legacy_api_urls')),
]
