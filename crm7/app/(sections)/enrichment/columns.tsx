'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import type { ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';

export type EnrichmentLog = {
  id: string;
  entity_type: string;
  entity_id: string;
  source: string;
  enrichment_type: string;
  status: string;
  error_message?: string;
  created_at: string;
  created_by: string;
  metadata: Record<string, unknown>;
};

export const enrichmentLogColumns: ColumnDef<EnrichmentLog>[] = [
  {
    accessorKey: 'created_at',
    header: 'Date',
    cell: ({ row }: { row: { getValue: (key: string) => string } }): string => {
      return format(new Date(row.getValue('created_at')), 'dd/MM/yyyy HH:mm');
    },
  },
  {
    accessorKey: 'entity_type',
    header: 'Type',
  },
  {
    accessorKey: 'enrichment_type',
    header: 'Enrichment',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }: { row: { getValue: (key: string) => string } }): ReactNode => {
      const status = row.getValue('status');
      const variantMap = {
        pending: 'default',
        completed: 'success',
        failed: 'destructive',
      } as const;

      return <Badge variant={variantMap[status as keyof typeof variantMap]}>{status}</Badge>;
    },
  },
  {
    accessorKey: 'source',
    header: 'Source',
  },
  {
    accessorKey: 'error_message',
    header: 'Error',
    cell: ({ row }: { row: { getValue: (key: string) => string | null } }): ReactNode => {
      const error = row.getValue('error_message');
      return error ? <span className='text-sm text-red-500'>{error}</span> : null;
    },
  },
];
