import type { Metadata } from 'next'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { ShieldCheck } from 'lucide-react'

export const metadata: Metadata = { title: 'IRIS Audit Log' }

export default function AuditPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="IRIS Audit Log" description="Immutable audit trail for all document and system actions" />
      <EmptyState icon={ShieldCheck} title="Audit log coming soon" description="Connects to GET /audit/logs in next sprint." />
    </div>
  )
}
