import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  change?: {
    value: string;
    positive?: boolean;
    text: string;
  };
}

const StatCard = ({ title, value, icon: Icon, iconColor, iconBgColor, change }: StatCardProps) => {
  return (
    <Card>
      <CardContent className="p-4 flex items-center">
        <div className={cn('p-3 mr-4 rounded-full flex items-center justify-center', iconBgColor)}>
          <Icon className={cn('h-5 w-5', iconColor)} />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-lg font-semibold text-foreground">{value}</p>
          {change && (
            <p
              className={cn(
                'text-xs flex items-center mt-1',
                change.positive ? 'text-success' : 'text-destructive'
              )}
            >
              <span className="mr-1">{change.positive ? '↑' : '↓'}</span>
              {change.value} {change.text}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
