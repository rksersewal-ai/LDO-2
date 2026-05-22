'use client'

import * as React from 'react'
import { ChevronRight, FileText, Package, Search } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface BomNode {
  id: string
  part_number: string
  description: string
  quantity: number
  children?: BomNode[]
  document_id?: string
}

const mockTree: BomNode = {
  id: 'root', part_number: 'WAG9-ASSY-ROOT', description: 'WAG9 Complete Assembly', quantity: 1,
  children: [
    {
      id: 'tm', part_number: 'WAG9-TM-001', description: 'Traction Motor System', quantity: 6,
      children: [
        { id: 'tm-stator', part_number: 'TM-STATOR-A', description: 'Stator Core', quantity: 1, document_id: 'doc-1' },
        { id: 'tm-rotor', part_number: 'TM-ROTOR-B', description: 'Rotor Assembly', quantity: 1, document_id: 'doc-2' },
      ],
    },
    {
      id: 'brk', part_number: 'WAG9-BRK-002', description: 'Braking System', quantity: 4,
      children: [
        { id: 'brk-caliper', part_number: 'BRK-CALIPER', description: 'Brake Caliper', quantity: 2, document_id: 'doc-3' },
      ],
    },
    { id: 'panto', part_number: 'WAG9-PAN-003', description: 'Pantograph Assembly', quantity: 2, document_id: 'doc-4' },
  ],
}

function TreeNode({ node, depth = 0 }: { node: BomNode; depth?: number }) {
  const hasChildren = node.children && node.children.length > 0
  return (
    <Collapsible defaultOpen={depth === 0}>
      <div className={cn('flex items-center gap-2 py-1.5 rounded-md hover:bg-muted/50 px-2', depth > 0 && 'ml-4')}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0" disabled={!hasChildren} aria-label={`${hasChildren ? 'Toggle' : 'No children for'} ${node.part_number}`}>
            {hasChildren ? <ChevronRight className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-90" /> : <span className="h-3 w-3" />}
          </Button>
        </CollapsibleTrigger>
        {hasChildren ? <Package className="h-4 w-4 shrink-0 text-muted-foreground" /> : <FileText className="h-4 w-4 shrink-0 text-blue-500" />}
        <span className="font-mono text-xs font-medium">{node.part_number}</span>
        <span className="text-sm text-muted-foreground flex-1 truncate">{node.description}</span>
        <Badge variant="outline" className="text-xs shrink-0">×{node.quantity}</Badge>
      </div>
      {hasChildren && (
        <CollapsibleContent>
          {node.children!.map((child) => <TreeNode key={child.id} node={child} depth={depth + 1} />)}
        </CollapsibleContent>
      )}
    </Collapsible>
  )
}

export function BomTree({ bomId }: { bomId: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 pb-3">
        <CardTitle className="text-sm">BOM Tree — {bomId}</CardTitle>
        <div className="relative ml-auto">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Filter parts..." className="h-8 pl-8 w-52 text-sm" />
        </div>
      </CardHeader>
      <CardContent>
        <TreeNode node={mockTree} />
      </CardContent>
    </Card>
  )
}
