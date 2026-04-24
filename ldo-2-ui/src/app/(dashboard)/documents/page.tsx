import type { Metadata } from 'next'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { DocumentTable } from '@/components/documents/document-table'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Documents' }

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Browse, search, and manage all locomotive documents"
        action={<Button asChild size="sm"><Link href="/documents/upload"><Upload className="mr-2 h-4 w-4" />Upload</Link></Button>}
      />
      <DocumentTable />
    </div>
  )
}
