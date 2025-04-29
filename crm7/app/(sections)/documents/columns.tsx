import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  status: 'pending' | 'approved' | 'rejected';
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
    <Button
      variant="ghost"
      onClick={(): void => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      {title}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
};

const formatFileSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

const renderActions = (document: Document): React.ReactElement => {
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
        <DropdownMenuItem onClick={(): Promise<void> => navigator.clipboard.writeText(document.id)}>
          Copy ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>View Document</DropdownMenuItem>
        <DropdownMenuItem>Download</DropdownMenuItem>
        <DropdownMenuItem>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const columns: ColumnDef<Document>[] = [
  {
    accessorKey: 'name',
    header: ({ column }): React.JSX.Element => (
      <SortableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: 'type',
    header: 'Type',
  },
  {
    accessorKey: 'size',
    header: 'Size',
    cell: ({ row }): string => formatFileSize(row.getValue('size')),
  },
  {
    accessorKey: 'uploadedAt',
    header: 'Uploaded',
    cell: ({ row }): string => format(new Date(row.getValue('uploadedAt')), 'dd/MM/yyyy'),
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
  {
    id: 'actions',
    cell: ({ row }): React.ReactElement => renderActions(row.original),
  },
];
