import { Badge } from '@/components/ui/badge';

function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' {
  switch (status.toLowerCase()) {
    case 'active':
      return 'success';
    case 'pending':
      return 'warning';
    case 'inactive':
      return 'destructive';
    default:
      return 'default';
  }
}

export function FundingProgramsDataTable(): JSX.Element {
  return (
    <div>
      {/* Table implementation */}
      <Badge variant={getStatusVariant(status)}>{String(status)}</Badge>
    </div>
  );
}
