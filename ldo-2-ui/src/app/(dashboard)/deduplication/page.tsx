import type { Metadata } from 'next'
import { PageHeader } from '@/components/shared/page-header'
import { DeduplicationResults } from '@/components/documents/deduplication-results'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = { title: 'Deduplication' }

export default function DeduplicationPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Document Deduplication"
        description="Detected duplicates based on content similarity"
        action={<Badge variant="secondary">23 duplicates found</Badge>}
      />
      <DeduplicationResults />
    </div>
  )
}
