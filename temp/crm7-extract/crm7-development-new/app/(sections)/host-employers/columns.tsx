'use client';

import type { ColumnDef, Row } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { type ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type HostEmployer = {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
  apprenticeCount: number;
};

export const columns: ColumnDef<HostEmployer>[] = [
  {
    accessorKey: 'name',
    header: 'Business Name',
  },
  {
    accessorKey: 'contactPerson',
    header: 'Contact Person',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
  },
  {
    accessorKey: 'apprenticeCount',
    header: 'Apprentices',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }: { row: Row<HostEmployer> }): ReactNode => {
      const status = row.getValue('status') as HostEmployer['status'];
      return (
        <div className={`capitalize ${status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
          {status}
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }: { row: Row<HostEmployer> }): ReactNode => {
      const employer = row.original;

      const handleCopyId = async (): Promise<void> => {
        try {
          await navigator.clipboard.writeText(employer.id);
        } catch (error: unknown) {
          console.error('Failed to copy ID to clipboard:', error);
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              className='h-8 w-8 p-0'
            >
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem onClick={handleCopyId}>Copy ID</DropdownMenuItem>
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Edit</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
