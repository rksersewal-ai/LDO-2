'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/shared/data-table'
import { Eye, GitBranch } from 'lucide-react'
import Link from 'next/link'
import { BOMItem } from '@/types/bom'

const mockBom: BOMItem[] = [
  { id: '1', part_number: 'WAG9-TM-001', description: 'Traction Motor Assembly', quantity: 6, parent_id: null, document_id: '1', locomotive_config_id: 'cfg-1', created_at: '2024-01-10' },
  { id: '2', part_number: 'WAP7-BRK-002', description: 'Brake Caliper Unit', quantity: 12, parent_id: null, document_id: '2', locomotive_config_id: 'cfg-2', created_at: '2024-02-15' },
]

const columns: ColumnDef<BOMItem>[] = [
  { accessorKey: 'part_number', header: 'Part Number', cell: ({ row }) => <span className="font-mono text-sm">{row.getValue('part_number')}</span> },
  { accessorKey: 'description', header: 'Description', cell: ({ row }) => <span className="text-sm">{row.getValue('description')}</span> },
  { accessorKey: 'quantity', header: 'Qty', cell: ({ row }) => <Badge variant="outline">{row.getValue('quantity')}</Badge> },
  { accessorKey: 'locomotive_config_id', header: 'Config', cell: ({ row }) => <span className="text-xs text-muted-foreground font-mono">{row.getValue('locomotive_config_id')}</span> },
  { accessorKey: 'created_at', header: 'Created', cell: ({ row }) => <span className="text-sm text-muted-foreground">{new Date(row.getValue('created_at')).toLocaleDateString()}</span> },
  {
    id: 'actions', header: 'Actions',
    cell: ({ row }) => (
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" className="h-7 w-7" asChild aria-label={`View BOM item ${row.original.part_number}`}><Link href={`/bom/${row.original.id}`}><Eye className="h-3.5 w-3.5" /></Link></Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" asChild aria-label={`View branches for BOM item ${row.original.part_number}`}><Link href={`/bom/${row.original.id}`}><GitBranch className="h-3.5 w-3.5" /></Link></Button>
      </div>
    ),
  },
]

export function BomTable() {
  return <DataTable columns={columns} data={mockBom} searchKey="description" searchPlaceholder="Search BOM..." />
}
