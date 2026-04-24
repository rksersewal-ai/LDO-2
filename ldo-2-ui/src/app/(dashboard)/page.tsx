import { Suspense } from 'react'
import { KpiCard } from '@/components/dashboard/kpi-card'
import { RecentDocuments } from '@/components/dashboard/recent-documents'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
import { DocumentStatsChart } from '@/components/dashboard/document-stats-chart'
import { PageHeader } from '@/components/shared/page-header'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { FileText, ScanLine, Settings2, HardDrive } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of LDO-2 Locomotive Document Organization System"
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Documents"
          value="2,847"
          trend="+12%"
          trendUp={true}
          description="vs last month"
          icon={FileText}
          iconColor="bg-blue-500/10 text-blue-600"
        />
        <KpiCard
          title="Pending OCR Jobs"
          value="34"
          trend="-8%"
          trendUp={false}
          description="vs last month"
          icon={ScanLine}
          iconColor="bg-orange-500/10 text-orange-600"
        />
        <KpiCard
          title="BOM Configurations"
          value="128"
          trend="+3%"
          trendUp={true}
          description="WAG9 / WAP7 configs"
          icon={Settings2}
          iconColor="bg-green-500/10 text-green-600"
        />
        <KpiCard
          title="Storage Used"
          value="47.2 GB"
          trend="+5%"
          trendUp={false}
          description="of 200 GB total"
          icon={HardDrive}
          iconColor="bg-purple-500/10 text-purple-600"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <Suspense fallback={<LoadingSkeleton rows={5} />}>
            <DocumentStatsChart />
          </Suspense>
        </div>
        <div className="col-span-3">
          <Suspense fallback={<LoadingSkeleton rows={5} />}>
            <ActivityFeed />
          </Suspense>
        </div>
      </div>
      <Suspense fallback={<LoadingSkeleton rows={5} />}>
        <RecentDocuments />
      </Suspense>
    </div>
  )
}
