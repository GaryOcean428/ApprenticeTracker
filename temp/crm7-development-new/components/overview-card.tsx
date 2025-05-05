import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface OverviewCardProps {
  title: string;
  value: string;
  change?: number;
  description?: string;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
}

export function OverviewCard({ title, value, change }: OverviewCardProps): React.ReactElement {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
      {typeof change !== 'undefined' && (
        <p className={cn(
          "mt-2 text-sm",
          change >= 0 ? "text-green-600" : "text-red-600"
        )}>
          {change >= 0 ? '+' : ''}{change}%
        </p>
      )}
    </div>
  );
}
