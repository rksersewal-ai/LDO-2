import type { Metadata } from 'next'
import { PageHeader } from '@/components/shared/page-header'
import { BomTree } from '@/components/bom/bom-tree'

export const metadata: Metadata = { title: 'BOM Tree' }

export default function BomDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <PageHeader title="BOM Structure" description={`Part tree for BOM: ${params.id}`} />
      <BomTree bomId={params.id} />
    </div>
  )
}
