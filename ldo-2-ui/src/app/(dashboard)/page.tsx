import type { Metadata } from 'next'
import { FileText, ScanLine, GitMerge, AlertTriangle, Upload } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { KpiCard } from '@/components/dashboard/kpi-card'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
import { RecentDocuments } from '@/components/dashboard/recent-documents'
import { DocumentStatsChart } from '@/components/dashboard/document-stats-chart'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Dashboard' }

const kpis = [
  { title: 'Total Documents', value: '1,842', trend: '+124 this month', trendUp: true, description: '', icon: FileText, iconColor: 'bg-blue-500/10 text-blue-600' },
  { title: 'OCR Processed', value: '1,634', trend: '88.7% coverage', trendUp: true, description: '', icon: ScanLine, iconColor: 'bg-orange-500/10 text-orange-600' },
  { title: 'Active BOMs', value: '247', trend: '+18 this month', trendUp: true, description: '', icon: GitMerge, iconColor: 'bg-green-500/10 text-green-600' },
  { title: 'Duplicates Found', value: '23', trend: '12 resolved', trendUp: false, description: '', icon: AlertTriangle, iconColor: 'bg-rose-500/10 text-rose-600' },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of LDO-2 document management activity"
        action={
          <Button asChild size="sm">
            <Link href="/documents/upload"><Upload className="mr-2 h-4 w-4" />Upload Document</Link>
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => <KpiCard key={kpi.title} {...kpi} />)}
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3"><DocumentStatsChart /></div>
        <div className="lg:col-span-2"><ActivityFeed /></div>
      </div>
      <RecentDocuments />
    </div>
  )
}
