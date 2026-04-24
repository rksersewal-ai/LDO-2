import { PageHeader } from '@/components/shared/page-header'

export default function AuditPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="IRIS Audit Log" description="IRIS compliance audit trail for all document operations" />
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        Audit log module — coming soon
      </div>
    </div>
  )
}
