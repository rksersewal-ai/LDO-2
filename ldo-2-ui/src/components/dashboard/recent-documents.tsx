'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, ExternalLink } from 'lucide-react'

const recentDocs = [
  { id: '1', title: 'WAG9_TRACTION_MOTOR_SPEC_V4.pdf', type: 'PDF', status: 'indexed', updated: '2 hours ago' },
  { id: '2', title: 'WAP7_BRAKE_SYSTEM_OVERHAUL.docx', type: 'DOCX', status: 'ocr_pending', updated: '5 hours ago' },
  { id: '3', title: 'CLW_BOM_ASSEMBLY_2024.pdf', type: 'PDF', status: 'indexed', updated: '1 day ago' },
  { id: '4', title: 'RDSO_SPEC_WAG9_REV7.pdf', type: 'PDF', status: 'indexed', updated: '2 days ago' },
  { id: '5', title: 'PANTOGRAPH_ASSEMBLY_DWG.dwg', type: 'DWG', status: 'processing', updated: '3 days ago' },
]

const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  indexed: { label: 'Indexed', variant: 'default' },
  ocr_pending: { label: 'OCR Pending', variant: 'secondary' },
  processing: { label: 'Processing', variant: 'outline' },
}

export function RecentDocuments() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold">Recent Documents</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/documents">View all <ExternalLink className="ml-1 h-3 w-3" /></Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentDocs.map((doc) => (
            <div key={doc.id} className="flex items-center gap-3 rounded-lg border px-3 py-2 hover:bg-muted/50 transition-colors">
              <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{doc.title}</p>
                <p className="text-xs text-muted-foreground">Updated {doc.updated}</p>
              </div>
              <Badge variant={statusMap[doc.status]?.variant ?? 'outline'} className="shrink-0 text-xs">
                {statusMap[doc.status]?.label ?? doc.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
