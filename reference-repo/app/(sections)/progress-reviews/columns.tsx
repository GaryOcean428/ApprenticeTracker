import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import styles from './progress-reviews.module.css';
import type { ProgressReview } from './types';

export const columns: ColumnDef<ProgressReview>[] = [
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }): React.JSX.Element => {
      const type = row.getValue('type') as string;
      return <div className='capitalize'>{type}</div>;
    },
  },
  {
    accessorKey: 'progress',
    header: 'Progress',
    cell: ({ row }): React.JSX.Element => {
      const progress = row.getValue('progress') as number;
      const progressClass = progress < 30 ? 'low' : progress < 70 ? 'medium' : 'high';

      return (
        <div className={styles['progressBar']}>
          <div className={`${styles['progressFill']} ${styles[progressClass]}`} />
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }): React.JSX.Element => {
      const status = row.getValue('status') as string;
      const variantMap = {
        completed: 'success',
        pending: 'warning',
        failed: 'destructive',
      } as const;

      return <Badge variant={variantMap[status as keyof typeof variantMap]}>{status}</Badge>;
    },
  },
];
