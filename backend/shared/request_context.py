from contextvars import ContextVar


correlation_id_var = ContextVar('correlation_id', default='')
tenant_id_var = ContextVar('tenant_id', default='')
plant_id_var = ContextVar('plant_id', default='')


def set_request_context(correlation_id: str, tenant_id: str = '', plant_id: str = ''):
    return {
        'correlation_id': correlation_id_var.set(correlation_id),
        'tenant_id': tenant_id_var.set(tenant_id),
        'plant_id': plant_id_var.set(plant_id),
    }


def clear_request_context(tokens):
    if not tokens:
        return
    correlation_id_var.reset(tokens['correlation_id'])
    tenant_id_var.reset(tokens['tenant_id'])
    plant_id_var.reset(tokens['plant_id'])


def get_correlation_id() -> str:
    return correlation_id_var.get()


def get_tenant_id() -> str:
    return tenant_id_var.get()


def get_plant_id() -> str:
    return plant_id_var.get()

