'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GitMerge, Trash2, Eye } from 'lucide-react'

const mockDuplicates = [
  { id: '1', original: 'WAG9_TRACTION_SPEC_V3.pdf', duplicate: 'WAG9_TRACTION_SPEC_V3_copy.pdf', similarity: 98, status: 'pending' },
  { id: '2', original: 'BRAKE_MANUAL_2023.pdf', duplicate: 'BRAKE_MANUAL_2023_final.pdf', similarity: 94, status: 'pending' },
  { id: '3', original: 'RDSO_SPEC_REV5.pdf', duplicate: 'RDSO_SPEC_REV5_backup.pdf', similarity: 100, status: 'resolved' },
]

export function DeduplicationResults() {
  return (
    <div className="space-y-4">
      {mockDuplicates.map((item) => (
        <Card key={item.id}>
          <CardContent className="flex items-center gap-4 p-4">
            <GitMerge className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="flex-1 min-w-0 grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-muted-foreground">Original</p>
                <p className="text-sm font-medium truncate">{item.original}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Duplicate</p>
                <p className="text-sm font-medium truncate">{item.duplicate}</p>
              </div>
            </div>
            <Badge variant={item.similarity === 100 ? 'destructive' : 'secondary'} className="shrink-0">
              {item.similarity}% match
            </Badge>
            <Badge variant={item.status === 'resolved' ? 'default' : 'outline'} className="shrink-0 capitalize">
              {item.status}
            </Badge>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={`View duplicate ${item.duplicate}`}><Eye className="h-3.5 w-3.5" /></Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" aria-label={`Delete duplicate ${item.duplicate}`}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
