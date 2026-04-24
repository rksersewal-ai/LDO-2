import { PageHeader } from '@/components/shared/page-header'
import { DocumentUploadZone } from '@/components/documents/document-upload-zone'

export default function DocumentUploadPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Upload Documents"
        description="Upload PDF, DOCX, DWG, and image files for processing"
      />
      <DocumentUploadZone />
    </div>
  )
}
