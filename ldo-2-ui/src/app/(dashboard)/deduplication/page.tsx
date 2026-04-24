import { PageHeader } from '@/components/shared/page-header'
import { DeduplicationResults } from '@/components/documents/deduplication-results'

export default function DeduplicationPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Deduplication"
        description="Review and resolve duplicate document detections"
      />
      <DeduplicationResults />
    </div>
  )
}
