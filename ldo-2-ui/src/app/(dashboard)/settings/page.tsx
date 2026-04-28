import type { Metadata } from 'next'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Settings } from 'lucide-react'

export const metadata: Metadata = { title: 'Settings' }

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="System config, user management, and preferences" />
      <EmptyState icon={Settings} title="Settings coming soon" description="User management and system config available next sprint." />
    </div>
  )
}
