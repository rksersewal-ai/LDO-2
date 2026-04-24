'use client'

import { useSearchParams } from 'next/navigation'
import { PageHeader } from '@/components/shared/page-header'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''

  return (
    <div className="space-y-6">
      <PageHeader
        title="Search Results"
        description={query ? `Showing results for "${query}"` : 'Enter a search query'}
      />
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        Full-text search module — coming soon
      </div>
    </div>
  )
}
