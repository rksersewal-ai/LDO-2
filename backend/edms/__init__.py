from importlib import import_module

__all__ = ("celery_app",)


def __getattr__(name):
    if name == "celery_app":
        return import_module(".celery", __name__).app
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
