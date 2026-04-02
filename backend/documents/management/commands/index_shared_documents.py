from pathlib import Path

from django.core.management.base import BaseCommand, CommandError

from documents.services import CrawlJobService
from documents.models import CrawlJob, IndexedSource


class Command(BaseCommand):
    help = 'Index a shared/network folder into local EDMS metadata, hashes, and dedup groups.'

    def add_arguments(self, parser):
        parser.add_argument('root_path')
        parser.add_argument('--source-system', default='NETWORK_SHARE')
        parser.add_argument('--extensions', default='')
        parser.add_argument('--force-full-hash', action='store_true', dest='force_full_hash')

    def handle(self, *args, **options):
        root = Path(options['root_path'])
        if not root.exists() or not root.is_dir():
            raise CommandError(f'Root path not found or not a directory: {root}')

        source, _ = IndexedSource.objects.update_or_create(
            root_path=str(root),
            defaults={
                'name': root.name,
                'source_system': options['source_system'],
                'include_extensions': [
                    extension.strip().lower()
                    for extension in str(options['extensions']).split(',')
                    if extension.strip()
                ],
                'watch_enabled': True,
                'is_active': True,
            },
        )
        job = CrawlJobService.create_job(source, parameters={'force_full_hash': options['force_full_hash']})
        CrawlJobService.run_job(job, force_full_hash=options['force_full_hash'])
        source.refresh_from_db()
        job = CrawlJob.objects.get(pk=job.pk)
        self.stdout.write(
            self.style.SUCCESS(
                f'Indexed {job.indexed_count} shared document(s) from {source.root_path} '
                f'with {job.duplicate_count} duplicate(s).'
            )
        )
