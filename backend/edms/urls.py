from django.urls import include, path

urlpatterns = [
    path('', include('edms_api.urls')),
]
