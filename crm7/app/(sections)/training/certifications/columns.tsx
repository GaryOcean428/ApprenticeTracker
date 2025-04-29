'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { MoreHorizontalIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Certification {
  id: string;
  name: string;
  certification: string;
  issuedDate: string;
  expiryDate: string;
  status: string;
}

export const columns: ColumnDef<Certification>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Employee Name" />,
  },
  {
    accessorKey: 'certification',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Certification" />,
  },
  {
    accessorKey: 'issuedDate',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Issue Date" />,
    cell: ({ row }) => {
      const date = row.getValue('issuedDate') as string;
      return new Date(date).toLocaleDateString();
    },
  },
  {
    accessorKey: 'expiryDate',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Expiry Date" />,
    cell: ({ row }) => {
      const date = row.getValue('expiryDate') as string;
      return new Date(date).toLocaleDateString();
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge
          variant={
            status === 'Active' ? 'success' : status === 'Expiring Soon' ? 'warning' : 'destructive'
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const cert = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(cert.id)}>
              Copy certification ID
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => (window.location.href = `/training/certifications/${cert.id}`)}
            >
              View details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => (window.location.href = `/training/certifications/${cert.id}/renew`)}
            >
              Renew certification
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => (window.location.href = `/training/certifications/${cert.id}/edit`)}
            >
              Edit record
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
