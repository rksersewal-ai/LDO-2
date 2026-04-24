import { PageHeader } from '@/components/shared/page-header'
import { BomTable } from '@/components/bom/bom-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default function BomPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Bill of Materials"
        description="Manage BOM structures for WAG9 and WAP7 locomotive configurations"
        action={
          <Link href="/bom/create">
            <Button><Plus className="mr-2 h-4 w-4" />New BOM</Button>
          </Link>
        }
      />
      <BomTable />
    </div>
  )
}
