import { PageHeader } from '@/components/shared/page-header'
import { OcrJobQueue } from '@/components/ocr/ocr-job-queue'

export default function OcrPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="OCR Jobs"
        description="Monitor and manage document OCR processing jobs"
      />
      <OcrJobQueue />
    </div>
  )
}
