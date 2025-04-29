'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type Qualification = {
  id: string;
  title: string;
  code: string;
  level: number;
  duration: number;
  status: 'active' | 'archived';
  market_data?: Record<string, unknown>;
};

interface SortableColumnProps {
  column: { 
    toggleSorting: (descending: boolean) => void; 
    getIsSorted: () => 'asc' | 'desc' | false;
  };
  title: string;
}

const SortableColumnHeader = ({ column, title }: SortableColumnProps): React.ReactElement => {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      {title}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
};

export const columns: ColumnDef<Qualification>[] = [
  {
    accessorKey: 'title',
    header: ({ column }): React.ReactElement => (
      <SortableColumnHeader
        column={column}
        title="Title"
      />
    ),
  },
  {
    accessorKey: 'code',
    header: 'Code',
  },
  {
    accessorKey: 'level',
    header: 'Level',
  },
  {
    accessorKey: 'duration',
    header: 'Duration (months)',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }): React.ReactElement => {
      const status = row.getValue('status') as 'active' | 'archived';
      return <Badge variant={status === 'active' ? 'default' : 'secondary'}>{status}</Badge>;
    },
  },
  {
    id: 'market_data',
    header: 'Market Data',
    cell: ({ row }): React.ReactElement | null => {
      const marketData = row.original.market_data;
      return marketData ? <Badge variant="outline">Enriched</Badge> : null;
    },
  },
  {
    id: 'actions',
    cell: ({ row }): React.ReactElement => {
      const qualification = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(qualification.id)}>
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>View Market Data</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
