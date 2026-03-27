import logging

from .request_context import get_correlation_id, get_plant_id, get_tenant_id


class RequestContextFilter(logging.Filter):
    def filter(self, record):
        record.correlation_id = get_correlation_id() or '-'
        record.tenant_id = get_tenant_id() or '-'
        record.plant_id = get_plant_id() or '-'
        return True

