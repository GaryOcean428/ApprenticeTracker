'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
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
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

export interface Apprentice {
  id: string;
  name: string;
  email: string;
  startDate: string;
  status: 'active' | 'completed' | 'withdrawn';
  enrichedData?: Record<string, unknown>;
}

interface SortableColumnProps {
  column: {
    toggleSorting: (descending: boolean) => void;
    getIsSorted: () => 'asc' | 'desc' | false;
  };
  title: string;
}

const SortableColumnHeader = ({ column, title }: SortableColumnProps): React.ReactElement => {
  return (
    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
      {title}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
};

const renderStatus = (status: Apprentice['status']): React.ReactElement => {
  const variantMap = {
    active: 'default',
    completed: 'success',
    withdrawn: 'destructive'
  } as const;

  return <Badge variant={variantMap[status]}>{status}</Badge>;
};

const renderActions = (apprentice: Apprentice): React.ReactElement => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(apprentice.id)}>
          Copy ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>View Details</DropdownMenuItem>
        <DropdownMenuItem>Edit</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const columns: ColumnDef<Apprentice>[] = [
  {
    accessorKey: 'name',
    header: ({ column }): React.ReactElement => (
      <SortableColumnHeader column={column} title="Name" />
    )
  },
  {
    accessorKey: 'email',
    header: 'Email'
  },
  {
    accessorKey: 'startDate',
    header: 'Start Date',
    cell: ({ row }): string => format(new Date(row.getValue('startDate')), 'dd/MM/yyyy')
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }): React.ReactElement => renderStatus(row.getValue('status'))
  },
  {
    id: 'actions',
    cell: ({ row }): React.ReactElement => renderActions(row.original)
  }
];
