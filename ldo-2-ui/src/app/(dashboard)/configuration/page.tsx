import type { Metadata } from 'next'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { ConfigList } from '@/components/configuration/config-list'

export const metadata: Metadata = { title: 'Locomotive Configuration' }

export default function ConfigurationPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Locomotive Configuration"
        description="WAG9 and WAP7 configs with component assignments"
        action={<Button size="sm"><Plus className="mr-2 h-4 w-4" />New Config</Button>}
      />
      <ConfigList />
    </div>
  )
}
