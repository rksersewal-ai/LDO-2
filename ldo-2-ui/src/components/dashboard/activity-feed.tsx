'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDistanceToNow } from 'date-fns'

const activities = [
  { id: 1, action: 'Document uploaded', detail: 'WAG9_TRQ_SPEC_2024.pdf', user: 'Admin', time: new Date(Date.now() - 5 * 60000), type: 'upload' },
  { id: 2, action: 'OCR completed', detail: 'WAP7_BRAKE_MANUAL.pdf', user: 'System', time: new Date(Date.now() - 18 * 60000), type: 'ocr' },
  { id: 3, action: 'BOM updated', detail: 'WAG9-BOM-001 rev3', user: 'Admin', time: new Date(Date.now() - 45 * 60000), type: 'bom' },
  { id: 4, action: 'Duplicate detected', detail: 'TRACTION_MOTOR_V2.pdf', user: 'System', time: new Date(Date.now() - 2 * 3600000), type: 'dedup' },
  { id: 5, action: 'Config created', detail: 'WAP7 SN-2024-0087', user: 'Admin', time: new Date(Date.now() - 3 * 3600000), type: 'config' },
]

const badgeVariant: Record<string, string> = {
  upload: 'bg-blue-500/10 text-blue-600',
  ocr: 'bg-orange-500/10 text-orange-600',
  bom: 'bg-green-500/10 text-green-600',
  dedup: 'bg-rose-500/10 text-rose-600',
  config: 'bg-purple-500/10 text-purple-600',
}

export function ActivityFeed() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[320px] px-6">
          <div className="space-y-4 pb-4">
            {activities.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${badgeVariant[item.type]}`}>
                  {item.type[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight">{item.action}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(item.time, { addSuffix: true })}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
