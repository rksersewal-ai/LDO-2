import { PageHeader } from '@/components/shared/page-header'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="System configuration and user management" />
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        Settings module — coming soon
      </div>
    </div>
  )
}
