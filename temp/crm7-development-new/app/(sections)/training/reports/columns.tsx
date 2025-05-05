'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';

interface TrainingRecord {
  id: string;
  employee: string;
  course: string;
  status: string;
  score: number | null;
  completedAt: string | null;
}

export const columns: ColumnDef<TrainingRecord>[] = [
  {
    accessorKey: 'employee',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Employee" />,
  },
  {
    accessorKey: 'course',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Course" />,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge
          variant={
            status === 'Completed' ? 'success' : status === 'In Progress' ? 'warning' : 'secondary'
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'score',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Score" />,
    cell: ({ row }) => {
      const score = row.getValue('score') as number | null;
      return score ? `${score}%` : '-';
    },
  },
  {
    accessorKey: 'completedAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Completed" />,
    cell: ({ row }) => {
      const date = row.getValue('completedAt') as string | null;
      return date ? new Date(date).toLocaleDateString() : '-';
    },
  },
];
