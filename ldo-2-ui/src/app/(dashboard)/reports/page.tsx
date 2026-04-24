import type { Metadata } from 'next'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { BarChart3 } from 'lucide-react'

export const metadata: Metadata = { title: 'Reports' }

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Document statistics, OCR coverage, and activity reports" />
      <EmptyState icon={BarChart3} title="Reports coming soon" description="Detailed analytics and exportable reports in next sprint." />
    </div>
  )
}
