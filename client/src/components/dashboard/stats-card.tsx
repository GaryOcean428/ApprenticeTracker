import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    positive?: boolean;
    text?: string;
  };
  icon?: ReactNode;
  iconColor?: string;
  iconBgColor?: string;
  className?: string;
}

export default function StatsCard({
  title,
  value,
  change,
  icon,
  iconColor = 'text-primary',
  iconBgColor = 'bg-primary/10',
  className,
}: StatsCardProps): JSX.Element {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {icon && (
            <div className={`${iconBgColor} p-2 rounded-full`}>
              <div className={iconColor}>{icon}</div>
            </div>
          )}
        </div>
        <div className="mt-2">
          <p className="text-3xl font-bold">{value}</p>
          {change && (
            <div className="mt-1 flex items-center">
              <span
                className={`text-xs ${
                  change.positive !== undefined
                    ? change.positive
                      ? 'text-success'
                      : 'text-destructive'
                    : 'text-muted-foreground'
                }`}
              >
                {change.value}
              </span>
              {change.text && (
                <span className="ml-1 text-xs text-muted-foreground">{change.text}</span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
