import type { DashboardAlert } from '@/types/dashboard';
import PlacementTrends from '@/components/dashboard/placement-trends';
import { AlertsSection } from '@/components/dashboard/alerts-section';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { DashboardStats } from '@/components/dashboard/stats-cards';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

const mockMonthlyData = [
  { date: '2023-01', count: 12 },
  { date: '2023-02', count: 15 },
  { date: '2023-03', count: 18 },
  // ... more data
].map(item => ({
  date: item.date,
  count: item.count,
}));

const mockAlerts: DashboardAlert[] = [
  {
    id: '1',
    title: 'Compliance Documents Expiring',
    description: '15 candidates have documents expiring in the next 30 days',
    severity: 'high',
    type: 'warning',
  },
  {
    id: '2',
    title: 'New Training Requirements',
    description: 'Updated workplace safety training requirements for all candidates',
    severity: 'medium',
    type: 'info',
  },
];

export default async function DashboardPage(): Promise<React.ReactElement> {
  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<StatsCardsSkeleton />}>
          <DashboardStats
            totalCandidates={2451}
            activeRecruitments={156}
            activePlacements={847}
            complianceAlerts={15}
          />
        </Suspense>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <Suspense fallback={<PlacementTrendsSkeleton />}>
            <PlacementTrends data={mockMonthlyData} />
          </Suspense>
        </div>
        <div className="col-span-3">
          <QuickActions />
        </div>
      </div>

      <div className="grid gap-4">
        <Suspense fallback={<AlertsSkeleton />}>
          <AlertsSection alerts={mockAlerts} />
        </Suspense>
      </div>
    </div>
  );
}

function StatsCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="p-6">
          <Skeleton className="h-7 w-[120px]" />
          <Skeleton className="mt-4 h-4 w-[60px]" />
        </Card>
      ))}
    </div>
  );
}

function PlacementTrendsSkeleton() {
  return (
    <Card className="col-span-4">
      <div className="p-6">
        <Skeleton className="h-[350px]" />
      </div>
    </Card>
  );
}

function AlertsSkeleton() {
  return (
    <Card>
      <div className="p-6">
        <Skeleton className="h-[200px]" />
      </div>
    </Card>
  );
}
