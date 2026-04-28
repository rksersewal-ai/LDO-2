import type { Metadata } from 'next'
import { PageHeader } from '@/components/shared/page-header'
import { OcrJobQueue } from '@/components/ocr/ocr-job-queue'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = { title: 'OCR Jobs' }

export default function OcrPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="OCR Jobs"
        description="Monitor OCR processing queue"
        action={<Badge variant="outline" className="text-orange-600 border-orange-400">1 processing</Badge>}
      />
      <OcrJobQueue />
    </div>
  )
}
