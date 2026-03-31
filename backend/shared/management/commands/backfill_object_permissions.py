from collections.abc import Iterable

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db.models import Model, Q

from config_mgmt.services import SupervisorDocumentReviewService
from documents.models import CrawlJob, DuplicateDecision, HashBackfillJob, IndexedSource
from edms_api.models import (
    Approval,
    Baseline,
    Case,
    ChangeNotice,
    ChangeRequest,
    Document,
    PlItem,
    SupervisorDocumentReview,
    WorkRecord,
)
from shared.models import ReportJob
from shared.permissions import PermissionService


User = get_user_model()


class Command(BaseCommand):
    help = 'Backfill guardian object permissions for legacy records created before service-layer permission assignment existed.'

    model_configs = [
        {'label': 'documents', 'model': Document, 'user_fields': ('author',)},
        {'label': 'pl_items', 'model': PlItem, 'name_fields': ('design_supervisor', 'concerned_supervisor')},
        {'label': 'supervisor_reviews', 'model': SupervisorDocumentReview, 'user_fields': ('requested_by', 'resolved_by'), 'name_fields': ('design_supervisor',)},
        {'label': 'work_records', 'model': WorkRecord, 'user_fields': ('user_name', 'verified_by')},
        {'label': 'cases', 'model': Case, 'user_fields': ('assigned_to', 'resolved_by', 'created_by')},
        {'label': 'approvals', 'model': Approval, 'user_fields': ('requested_by', 'approved_by', 'rejected_by')},
        {'label': 'change_requests', 'model': ChangeRequest, 'user_fields': ('requested_by', 'reviewed_by')},
        {'label': 'change_notices', 'model': ChangeNotice, 'user_fields': ('issued_by', 'approved_by', 'released_by', 'closed_by')},
        {'label': 'baselines', 'model': Baseline, 'user_fields': ('created_by', 'released_by')},
        {'label': 'indexed_sources', 'model': IndexedSource, 'user_fields': ('created_by',)},
        {'label': 'crawl_jobs', 'model': CrawlJob, 'user_fields': ('requested_by',)},
        {'label': 'hash_backfill_jobs', 'model': HashBackfillJob, 'user_fields': ('requested_by',)},
        {'label': 'duplicate_decisions', 'model': DuplicateDecision, 'user_fields': ('decided_by',)},
        {'label': 'report_jobs', 'model': ReportJob, 'user_fields': ('requested_by',)},
    ]

    def add_arguments(self, parser):
        parser.add_argument('--dry-run', action='store_true', help='Show what would be granted without writing permissions.')
        parser.add_argument('--model', dest='model_label', help='Process only one configured model label.')

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        model_label = options.get('model_label')

        configs = self.model_configs
        if model_label:
          configs = [config for config in configs if config['label'] == model_label]
          if not configs:
              self.stderr.write(self.style.ERROR(f'Unknown model label: {model_label}'))
              return

        total_objects = 0
        total_grants = 0

        for config in configs:
            objects, grants = self._process_model(config, dry_run=dry_run)
            total_objects += objects
            total_grants += grants
            self.stdout.write(
                f"{config['label']}: scanned {objects} object(s), granted {grants} permission assignment(s){' [dry-run]' if dry_run else ''}"
            )

        self.stdout.write(
            self.style.SUCCESS(
                f'Completed object-permission backfill for {total_objects} object(s); {total_grants} permission assignment(s) processed.'
            )
        )

    def _process_model(self, config: dict, *, dry_run: bool) -> tuple[int, int]:
        queryset = config['model'].objects.all()
        objects_scanned = 0
        grants = 0
        for instance in queryset.iterator():
            objects_scanned += 1
            users = self._collect_users(instance, config)
            if not users:
                continue
            if dry_run:
                grants += len(users)
                continue
            granted = PermissionService.grant_default_object_permissions(instance, *users)
            grants += len(granted)
        return objects_scanned, grants

    def _collect_users(self, instance: Model, config: dict) -> list[User]:
        users: list[User] = []

        for field_name in config.get('user_fields', ()):
            user = getattr(instance, field_name, None)
            if getattr(user, 'pk', None):
                users.append(user)

        for field_name in config.get('name_fields', ()):
            value = getattr(instance, field_name, None)
            users.extend(self._resolve_users_by_name(value))

        # Reuse the same supervisor matching logic for document-review legacy rows.
        if isinstance(instance, SupervisorDocumentReview):
            users.extend(SupervisorDocumentReviewService.matched_design_supervisor_users(instance.design_supervisor))

        deduped: list[User] = []
        seen_ids: set[int] = set()
        for user in users:
            if not getattr(user, 'pk', None) or user.pk in seen_ids:
                continue
            seen_ids.add(user.pk)
            deduped.append(user)
        return deduped

    def _resolve_users_by_name(self, raw_name: str | None) -> Iterable[User]:
        normalized = (raw_name or '').strip()
        if not normalized:
            return []

        queryset = User.objects.filter(
            Q(username__iexact=normalized)
            | Q(email__iexact=normalized)
            | Q(first_name__iexact=normalized)
            | Q(last_name__iexact=normalized)
        ).distinct()
        matches = list(queryset)
        if matches:
            return matches

        lowered = normalized.lower()
        return [
            user
            for user in User.objects.all()
            if lowered == (user.get_full_name() or '').strip().lower()
            or lowered in (user.get_full_name() or '').strip().lower()
        ]
