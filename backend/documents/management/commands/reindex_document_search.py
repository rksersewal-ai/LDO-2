from django.core.management.base import BaseCommand

from documents.indexing import DocumentIndexOrchestrator
from documents.models import HashBackfillJob
from edms_api.models import Document


class Command(BaseCommand):
    help = 'Rebuild local metadata and search indexes for documents.'

    def add_arguments(self, parser):
        parser.add_argument('--document-id', dest='document_id')
        parser.add_argument('--only-missing', action='store_true', dest='only_missing')
        parser.add_argument('--force-hashes', action='store_true', dest='force_hashes')
        parser.add_argument('--force-full-hash', action='store_true', dest='force_full_hash')

    def handle(self, *args, **options):
        backfill_job = HashBackfillJob.objects.create(
            parameters={
                'document_id': options.get('document_id') or '',
                'only_missing': bool(options['only_missing']),
                'force_hashes': bool(options['force_hashes']),
                'force_full_hash': bool(options['force_full_hash']),
            },
            batch_size=500,
        )
        backfill_job.start()
        backfill_job.save(update_fields=['status', 'started_at', 'error_message', 'updated_at'])
        queryset = Document.objects.all().order_by('created_at')

        if options['document_id']:
            queryset = queryset.filter(id=options['document_id'])

        if options['only_missing']:
            queryset = queryset.filter(search_indexed_at__isnull=True)

        updated = 0
        for document in queryset.iterator():
            DocumentIndexOrchestrator.index_document(
                document,
                force_hashes=options['force_hashes'],
                force_full_hash=options['force_full_hash'],
            )
            updated += 1

        backfill_job.documents_scanned = updated
        backfill_job.documents_indexed = updated
        backfill_job.full_hashes_computed = updated if options['force_full_hash'] else 0
        backfill_job.complete()
        backfill_job.save(update_fields=['documents_scanned', 'documents_indexed', 'full_hashes_computed', 'status', 'completed_at', 'error_message', 'updated_at'])

        self.stdout.write(self.style.SUCCESS(f'Reindexed {updated} document(s).'))
