import type { Metadata } from 'next'
import { PageHeader } from '@/components/shared/page-header'
import { DocumentUploadZone } from '@/components/documents/document-upload-zone'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = { title: 'Upload Documents' }

export default function UploadPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader title="Upload Documents" description="Upload PDF, DOCX, DWG, or image files. OCR triggers automatically." />
      <DocumentUploadZone />
      <Card>
        <CardHeader><CardTitle className="text-sm">Upload Guidelines</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p>• Supported: PDF, DOCX, DWG, PNG, JPG, TIFF — max 50 MB per file</p>
          <p>• OCR processing starts automatically after upload</p>
          <p>• Duplicate detection runs within 60 seconds</p>
          <p>• Use descriptive filenames (e.g. WAG9_BRAKE_SPEC_REV3.pdf)</p>
        </CardContent>
      </Card>
    </div>
  )
}
