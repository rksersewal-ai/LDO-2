import uuid

from .request_context import clear_request_context, set_request_context


PUBLIC_API_PREFIXES = (
    '/api/auth/login/',
    '/api/auth/token/',
    '/api/auth/token/refresh/',
    '/api/health/status/',
    '/api/v1/auth/login/',
    '/api/v1/auth/token/',
    '/api/v1/auth/token/refresh/',
    '/api/v1/health/status/',
)


class RequestContextMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        correlation_id = request.headers.get('X-Correlation-ID') or uuid.uuid4().hex
        tenant_id = request.headers.get('X-Tenant-ID', '').strip()
        plant_id = request.headers.get('X-Plant-ID', '').strip()
        tokens = set_request_context(correlation_id, tenant_id, plant_id)
        request.correlation_id = correlation_id
        request.request_scope = {
            'tenant_id': tenant_id,
            'plant_id': plant_id,
            'requires_auth': request.path.startswith('/api/') and not request.path.startswith(PUBLIC_API_PREFIXES),
        }
        try:
            response = self.get_response(request)
        finally:
            clear_request_context(tokens)

        response['X-Correlation-ID'] = correlation_id
        if tenant_id:
            response['X-Tenant-ID'] = tenant_id
        if plant_id:
            response['X-Plant-ID'] = plant_id
        return response

