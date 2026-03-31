from django.core.management.base import BaseCommand

from documents.models import IndexedSource
from documents.watchers import SharedSourceWatcher


class Command(BaseCommand):
    help = 'Watch active indexed sources and queue crawl jobs for file changes.'

    def handle(self, *args, **options):
        watcher = SharedSourceWatcher()
        sources = IndexedSource.objects.filter(is_active=True, watch_enabled=True)
        watched = 0
        for source in sources:
            if watcher.watch_source(source):
                watched += 1
            else:
                self.stdout.write(self.style.WARNING(f'Skipping source "{source.name}" because its root path is unavailable.'))

        if watched == 0:
            self.stdout.write(self.style.WARNING('No active indexed sources are currently watchable.'))
            return

        self.stdout.write(self.style.SUCCESS(f'Watching {watched} indexed source(s). Press Ctrl+C to stop.'))
        try:
            watcher.start()
            watcher.observer.join()
        except KeyboardInterrupt:
            watcher.stop()
