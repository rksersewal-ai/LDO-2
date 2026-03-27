from django.urls import include, path

urlpatterns = [
    path('', include('shared.urls')),
    path('', include('documents.urls')),
    path('', include('config_mgmt.urls')),
    path('', include('work.urls')),
]

