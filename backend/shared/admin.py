from django.contrib import admin

from .models import DomainEvent


@admin.register(DomainEvent)
class DomainEventAdmin(admin.ModelAdmin):
    list_display = ('event_type', 'aggregate_type', 'aggregate_id', 'status', 'created_at')
    search_fields = ('event_type', 'aggregate_type', 'aggregate_id', 'correlation_id')
    list_filter = ('status', 'event_type', 'aggregate_type')
    readonly_fields = ('id', 'created_at', 'published_at')
