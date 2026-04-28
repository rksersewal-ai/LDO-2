import type { Metadata } from 'next'
import { PageHeader } from '@/components/shared/page-header'
import { DocumentViewer } from '@/components/documents/document-viewer'

export const metadata: Metadata = { title: 'Document Viewer' }

export default function DocumentDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-4">
      <PageHeader title="Document Viewer" description={`ID: ${params.id}`} />
      <DocumentViewer documentId={params.id} />
    </div>
  )
}
