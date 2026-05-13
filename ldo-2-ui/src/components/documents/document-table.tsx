'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/shared/data-table'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowUpDown, Eye, Pencil, Trash2, FileText } from 'lucide-react'
import Link from 'next/link'
import { Document } from '@/types/document'
import { useDocuments } from '@/hooks/use-documents'

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  indexed: 'default',
  ocr_pending: 'secondary',
  processing: 'outline',
  error: 'destructive',
}

const columns: ColumnDef<Document>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <Button variant="ghost" className="-ml-4 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Title <ArrowUpDown className="ml-2 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="font-medium text-sm max-w-[280px] truncate">{row.getValue('title')}</span>
      </div>
    ),
  },
  {
    accessorKey: 'file_type',
    header: 'Type',
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono text-xs">{row.getValue('file_type')}</Badge>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return <Badge variant={statusVariant[status] ?? 'outline'} className="text-xs capitalize">{status.replace('_', ' ')}</Badge>
    },
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <Button variant="ghost" className="-ml-4 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Created <ArrowUpDown className="ml-2 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {new Date(row.getValue('created_at')).toLocaleDateString()}
      </span>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={`View document ${row.original.title}`} asChild>
          <Link href={`/documents/${row.original.id}`}><Eye className="h-3.5 w-3.5" /></Link>
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={`Edit document ${row.original.title}`} asChild>
          <Link href={`/documents/${row.original.id}/edit`}><Pencil className="h-3.5 w-3.5" /></Link>
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" aria-label={`Delete document ${row.original.title}`}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    ),
  },
]

export function DocumentTable() {
  const { documents, isLoading } = useDocuments()

  return (
    <DataTable
      columns={columns}
      data={documents}
      searchKey="title"
      searchPlaceholder="Search documents..."
      isLoading={isLoading}
    />
  )
}
