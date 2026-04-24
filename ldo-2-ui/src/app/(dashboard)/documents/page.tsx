'use client'

import { Suspense } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { DocumentTable } from '@/components/documents/document-table'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'
import Link from 'next/link'

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Manage all locomotive engineering documents"
        action={
          <Link href="/documents/upload">
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Documents
            </Button>
          </Link>
        }
      />
      <Suspense fallback={<LoadingSkeleton rows={10} />}>
        <DocumentTable />
      </Suspense>
    </div>
  )
}
