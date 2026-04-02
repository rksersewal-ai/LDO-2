from pathlib import Path

from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer

from documents.models import CrawlJob, IndexedSource
from documents.services import CrawlJobService


class IndexedSourceEventHandler(FileSystemEventHandler):
    def __init__(self, source: IndexedSource):
        self.source = source

    def on_created(self, event):
        self._queue_job(event)

    def on_modified(self, event):
        self._queue_job(event)

    def on_moved(self, event):
        self._queue_job(event)

    def on_deleted(self, event):
        self._queue_job(event)

    def _queue_job(self, event):
        if getattr(event, 'is_directory', False) or not self.source.is_active or not self.source.watch_enabled:
            return
        if CrawlJob.objects.filter(source=self.source, status__in=['QUEUED', 'RUNNING']).exists():
            return
        parameters = {
            'trigger': event.event_type,
        }
        src_path = getattr(event, 'src_path', '')
        dest_path = getattr(event, 'dest_path', '')
        paths = [path for path in (src_path, dest_path) if path]
        if paths:
            parameters['paths'] = paths
        if src_path:
            parameters['path'] = src_path
        if dest_path:
            parameters['new_path'] = dest_path
        if event.event_type == 'moved' and src_path:
            parameters['old_path'] = src_path
        job = CrawlJobService.create_job(
            source=self.source,
            parameters=parameters,
        )
        from documents.tasks import run_indexed_source_crawl

        try:
            run_indexed_source_crawl.delay(str(job.id))
        except Exception:
            CrawlJobService.run_job(job)


class SharedSourceWatcher:
    def __init__(self):
        self.observer = Observer()

    def watch_source(self, source: IndexedSource):
        if not source.is_active or not source.watch_enabled:
            return False
        path = Path(source.root_path)
        if not path.exists():
            return False
        self.observer.schedule(IndexedSourceEventHandler(source), str(path), recursive=True)
        return True

    def start(self):
        self.observer.start()

    def stop(self):
        self.observer.stop()
        self.observer.join()
