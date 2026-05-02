'use client'

import * as React from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type FileStatus = 'pending' | 'uploading' | 'done' | 'error'

interface UploadFile {
  id: string
  file: File
  status: FileStatus
  progress: number
  error?: string
}

const ACCEPTED_TYPES = { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'image/*': ['.png', '.jpg', '.jpeg', '.tiff'], 'application/octet-stream': ['.dwg'] }

export function DocumentUploadZone() {
  const [files, setFiles] = React.useState<UploadFile[]>([])

  const onDrop = React.useCallback((accepted: File[]) => {
    const newFiles = accepted.map((f) => ({
      id: `${f.name}-${Date.now()}`,
      file: f,
      status: 'pending' as FileStatus,
      progress: 0,
    }))
    setFiles((prev) => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: 50 * 1024 * 1024,
  })

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id))

  const uploadAll = async () => {
    for (const uf of files.filter((f) => f.status === 'pending')) {
      setFiles((prev) => prev.map((f) => f.id === uf.id ? { ...f, status: 'uploading' } : f))
      // Simulate progress — replace with real axios upload with onUploadProgress
      for (let p = 10; p <= 100; p += 10) {
        await new Promise((r) => setTimeout(r, 120))
        setFiles((prev) => prev.map((f) => f.id === uf.id ? { ...f, progress: p } : f))
      }
      setFiles((prev) => prev.map((f) => f.id === uf.id ? { ...f, status: 'done', progress: 100 } : f))
    }
  }

  const statusIcon = { pending: null, uploading: <Loader2 className="h-4 w-4 animate-spin text-blue-500" />, done: <CheckCircle2 className="h-4 w-4 text-emerald-500" />, error: <AlertCircle className="h-4 w-4 text-destructive" /> }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          'flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center cursor-pointer transition-colors',
          isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Upload className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="mt-4 text-sm font-semibold">{isDragActive ? 'Drop files here' : 'Drag & drop files here'}</p>
        <p className="mt-1 text-xs text-muted-foreground">PDF, DOCX, DWG, PNG, JPG, TIFF &mdash; Max 50 MB per file</p>
        <Button variant="outline" size="sm" className="mt-4">Browse files</Button>
      </div>

      {files.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-3">
            {files.map((uf) => (
              <div key={uf.id} className="flex items-center gap-3">
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium truncate">{uf.file.name}</p>
                    <div className="flex items-center gap-1">
                      {statusIcon[uf.status]}
                      <Badge variant="outline" className="text-xs">{(uf.file.size / 1024).toFixed(0)} KB</Badge>
                    </div>
                  </div>
                  {uf.status === 'uploading' && <Progress value={uf.progress} className="h-1" />}
                </div>
                {uf.status === 'pending' && (
                  <Button variant="ghost" size="icon" aria-label="Remove file" className="h-6 w-6 shrink-0" onClick={() => removeFile(uf.id)}>
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" onClick={() => setFiles([])}>Clear All</Button>
              <Button size="sm" onClick={uploadAll} disabled={files.every((f) => f.status !== 'pending')}>
                <Upload className="mr-2 h-4 w-4" />Upload All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
