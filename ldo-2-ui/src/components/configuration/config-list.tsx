'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Settings2, Eye, Pencil } from 'lucide-react'
import Link from 'next/link'

const configs = [
  { id: 'cfg-1', type: 'WAG9', serial: 'WAG9-SN-2024-001', components: 42, status: 'active', updated: '2024-04-01' },
  { id: 'cfg-2', type: 'WAP7', serial: 'WAP7-SN-2024-015', components: 38, status: 'active', updated: '2024-03-28' },
  { id: 'cfg-3', type: 'WAG9', serial: 'WAG9-SN-2024-002', components: 42, status: 'draft', updated: '2024-03-10' },
  { id: 'cfg-4', type: 'WAP7', serial: 'WAP7-SN-2023-088', components: 35, status: 'archived', updated: '2023-12-15' },
]

export function ConfigList() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {configs.map((cfg) => (
        <Card key={cfg.id}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Settings2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <Badge variant={cfg.type === 'WAG9' ? 'default' : 'secondary'} className="text-xs">{cfg.type}</Badge>
                </div>
              </div>
              <Badge variant={cfg.status === 'active' ? 'default' : cfg.status === 'draft' ? 'outline' : 'secondary'} className="text-xs capitalize">{cfg.status}</Badge>
            </div>
            <div>
              <p className="font-mono text-sm font-semibold">{cfg.serial}</p>
              <p className="text-xs text-muted-foreground">{cfg.components} components &middot; Updated {cfg.updated}</p>
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link href={`/configuration/${cfg.id}`}><Eye className="mr-1.5 h-3.5 w-3.5" />View</Link>
              </Button>
              <Button variant="ghost" size="sm" className="flex-1">
                <Pencil className="mr-1.5 h-3.5 w-3.5" />Edit
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
