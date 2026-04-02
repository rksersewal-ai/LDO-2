from django.db import OperationalError, ProgrammingError
from django.db.models.signals import post_delete, post_migrate, post_save
from django.dispatch import receiver

from edms_api.models import Document

from .indexing import DocumentIndexOrchestrator
from .models import IndexedSource
from .services import IndexedSourceService


@receiver(post_save, sender=Document)
def sync_document_search_index(sender, instance, **kwargs):
    DocumentIndexOrchestrator.index_document(instance)


@receiver(post_save, sender=IndexedSource)
def sync_indexed_source_schedule(sender, instance, **kwargs):
    try:
        IndexedSourceService.sync_source_schedule(instance)
    except (OperationalError, ProgrammingError):  # pragma: no cover - during early migration/app boot
        return


@receiver(post_delete, sender=IndexedSource)
def disable_deleted_source_schedule(sender, instance, **kwargs):
    try:
        IndexedSourceService.disable_source_schedule(instance)
    except (OperationalError, ProgrammingError):  # pragma: no cover - during early migration/app boot
        return


@receiver(post_migrate)
def sync_document_runtime_schedules(sender, **kwargs):
    if getattr(sender, 'name', None) != 'documents':
        return
    try:
        IndexedSourceService.sync_runtime_schedules()
    except (OperationalError, ProgrammingError):  # pragma: no cover - during initial migrate before beat tables exist
        return
