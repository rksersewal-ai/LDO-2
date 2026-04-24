'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScanLine, Eye, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

const jobs = [
  { id: 'job-1', document: 'WAP7_BRAKE_MANUAL.pdf', status: 'processing', progress: 65, created: '10 min ago' },
  { id: 'job-2', document: 'RDSO_WAG9_REV8.pdf', status: 'queued', progress: 0, created: '25 min ago' },
  { id: 'job-3', document: 'CLW_ASSEMBLY_DWG.pdf', status: 'completed', progress: 100, created: '1 hour ago' },
  { id: 'job-4', document: 'TRACTION_SPEC_V5.pdf', status: 'failed', progress: 30, created: '2 hours ago' },
]

const statusIcon: Record<string, React.ReactNode> = {
  processing: <ScanLine className="h-4 w-4 text-blue-500 animate-pulse" />,
  queued: <Clock className="h-4 w-4 text-orange-500" />,
  completed: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  failed: <AlertCircle className="h-4 w-4 text-destructive" />,
}

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  processing: 'default',
  queued: 'secondary',
  completed: 'outline',
  failed: 'destructive',
}

export function OcrJobQueue() {
  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <Card key={job.id}>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="shrink-0">{statusIcon[job.status]}</div>
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium truncate">{job.document}</p>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={statusVariant[job.status]} className="text-xs capitalize">{job.status}</Badge>
                  <span className="text-xs text-muted-foreground">{job.created}</span>
                </div>
              </div>
              {job.status === 'processing' && <Progress value={job.progress} className="h-1.5" />}
            </div>
            {job.status === 'completed' && (
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" asChild>
                <Link href={`/ocr/${job.id}`}><Eye className="h-3.5 w-3.5" /></Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
