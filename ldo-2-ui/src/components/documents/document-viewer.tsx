'use client'

import * as React from 'react'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

interface DocumentViewerProps {
  documentId: string
}

export function DocumentViewer({ documentId }: DocumentViewerProps) {
  const [page, setPage] = useState(1)
  const [totalPages] = useState(12)
  const [zoom, setZoom] = useState(100)

  return (
    <div className="flex gap-4 h-[calc(100vh-160px)]">
      {/* PDF Viewer Panel */}
      <div className="flex-1 flex flex-col rounded-lg border bg-card overflow-hidden">
        <div className="flex items-center gap-2 border-b px-4 py-2 bg-muted/30">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} aria-label="Previous page">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            value={page}
            onChange={(e) => setPage(Math.min(totalPages, Math.max(1, +e.target.value)))}
            className="w-14 h-7 text-center text-sm"
            min={1}
            max={totalPages}
            aria-label="Page number"
          />
          <span className="text-sm text-muted-foreground">/ {totalPages}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} aria-label="Next page">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-5" />
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(Math.min(200, zoom + 25))} aria-label="Zoom in">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground w-12 text-center">{zoom}%</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(Math.max(50, zoom - 25))} aria-label="Zoom out">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <div className="ml-auto flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Download document">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Maximize view">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center bg-muted/20 p-4">
          <div
            className="bg-white shadow-lg flex items-center justify-center text-muted-foreground text-sm"
            style={{ width: `${zoom * 5.5}px`, height: `${zoom * 7}px`, transition: 'all 0.2s', maxWidth: '100%', maxHeight: '100%' }}
          >
            PDF Viewer — Page {page} of {totalPages}<br />
            <span className="text-xs">Install react-pdf to render: Document ID {documentId}</span>
          </div>
        </div>
      </div>

      {/* Metadata Panel */}
      <div className="w-80 flex flex-col gap-3">
        <Card>
          <CardHeader className="py-3 px-4"><CardTitle className="text-sm">Document Metadata</CardTitle></CardHeader>
          <CardContent className="px-4 pb-4 space-y-2 text-sm">
            {[['ID', documentId], ['Type', 'PDF'], ['Status', 'indexed'], ['Pages', '12'], ['Size', '2.4 MB'], ['Uploaded', '2024-04-20']].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-medium font-mono text-xs">{v}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader className="py-3 px-4"><CardTitle className="text-sm">OCR Text</CardTitle></CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-64 px-4 pb-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                OCR extracted text will appear here after processing. Connect to /ocr/jobs/{'{jobId}'}/results endpoint to display extracted content.
              </p>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
