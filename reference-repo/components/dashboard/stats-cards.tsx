'use client';

import * as React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  description?: string;
}

function StatsCard({ title, value, change, description }: StatsCardProps) {
  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {change && (
          <div className={`flex items-center text-sm ${
            change.type === 'increase' ? 'text-emerald-500 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
          }`}>
            {change.type === 'increase' ? (
              <TrendingUp className="mr-1 h-4 w-4" />
            ) : (
              <TrendingDown className="mr-1 h-4 w-4" />
            )}
            {change.value}%
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

interface DashboardStatsProps {
  totalCandidates: number;
  activeRecruitments: number;
  activePlacements: number;
  complianceAlerts: number;
}

export function DashboardStats({
  totalCandidates,
  activeRecruitments,
  activePlacements,
  complianceAlerts,
}: DashboardStatsProps): JSX.Element {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Candidates"
        value={totalCandidates}
        change={{ value: 12, type: 'increase' }}
        description="vs last month"
      />
      <StatsCard
        title="Active Recruitments"
        value={activeRecruitments}
        change={{ value: 8.5, type: 'increase' }}
        description="vs last month"
      />
      <StatsCard
        title="Active Placements"
        value={activePlacements}
        change={{ value: 2.4, type: 'increase' }}
        description="vs last month"
      />
      <StatsCard
        title="Compliance Alerts"
        value={complianceAlerts}
        change={{ value: 15, type: 'decrease' }}
        description="vs last month"
      />
    </div>
  );
}
