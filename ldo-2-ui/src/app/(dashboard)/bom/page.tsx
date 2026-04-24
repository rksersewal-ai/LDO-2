import type { Metadata } from 'next'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { BomTable } from '@/components/bom/bom-table'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Bill of Materials' }

export default function BomPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Bill of Materials"
        description="Manage locomotive component hierarchies and part relationships"
        action={<Button asChild size="sm"><Link href="/bom/create"><Plus className="mr-2 h-4 w-4" />New BOM</Link></Button>}
      />
      <BomTable />
    </div>
  )
}
