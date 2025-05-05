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

interface Assessment {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  submissions: number;
  status: string;
}

export const columns: ColumnDef<Assessment>[] = [
  {
    accessorKey: 'title',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
  },
  {
    accessorKey: 'course',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Course" />,
  },
  {
    accessorKey: 'dueDate',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Due Date" />,
    cell: ({ row }) => {
      const date = row.getValue('dueDate') as string;
      return new Date(date).toLocaleDateString();
    },
  },
  {
    accessorKey: 'submissions',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Submissions" />,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge
          variant={
            status === 'Active' ? 'success' : status === 'Draft' ? 'secondary' : 'destructive'
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
      const assessment = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(assessment.id)}>
              Copy assessment ID
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => (window.location.href = `/training/assessments/${assessment.id}`)}
            >
              View details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                (window.location.href = `/training/assessments/${assessment.id}/submissions`)
              }
            >
              View submissions
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => (window.location.href = `/training/assessments/${assessment.id}/edit`)}
            >
              Edit assessment
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
