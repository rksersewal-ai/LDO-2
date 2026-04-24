import { PageHeader } from '@/components/shared/page-header'
import { BomTree } from '@/components/bom/bom-tree'

export default function BomDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-4">
      <PageHeader title="BOM Tree View" description={`BOM Configuration ID: ${params.id}`} />
      <BomTree bomId={params.id} />
    </div>
  )
}
