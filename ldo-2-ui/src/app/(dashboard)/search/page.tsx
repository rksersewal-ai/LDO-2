import type { Metadata } from 'next'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Search } from 'lucide-react'

export const metadata: Metadata = { title: 'Full-Text Search' }

export default function SearchPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Full-Text Search" description="Search across all document content and metadata" />
      <EmptyState icon={Search} title="Search coming soon" description="Full-text search via GET /search?q= will be wired in next sprint." />
    </div>
  )
}
