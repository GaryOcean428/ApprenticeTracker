'use client';

import { Card, CardContent } from '@/components/ui/card';

interface DashboardMetricsProps {
  opportunities: number;
  leads: number;
  organizations: number;
}

export function DashboardMetrics({ opportunities, leads, organizations }: Readonly<DashboardMetricsProps>) {
  const metrics = [
    {
      title: 'Opportunities',
      value: opportunities,
      description: 'Active opportunities',
      icon: '💰'
    },
    {
      title: 'Leads',
      value: leads,
      description: 'Active leads',
      icon: '🎯'
    },
    {
      title: 'Organizations',
      value: organizations,
      description: 'Associated organizations',
      icon: '🏢'
    }
  ];

  return (
    <>
      {metrics.map((metric) => (
        <Card key={metric.title} className="bg-card shadow hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{metric.description}</p>
                <p className="text-2xl font-bold mt-1">{metric.value}</p>
                <p className="text-base font-medium">{metric.title}</p>
              </div>
              <div className="text-3xl bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center">
                {metric.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
