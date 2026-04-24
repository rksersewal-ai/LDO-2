import { PageHeader } from '@/components/shared/page-header'
import { ConfigList } from '@/components/configuration/config-list'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function ConfigurationPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Locomotive Configurations"
        description="Manage WAG9 and WAP7 locomotive configuration entries"
        action={<Button><Plus className="mr-2 h-4 w-4" />New Configuration</Button>}
      />
      <ConfigList />
    </div>
  )
}
