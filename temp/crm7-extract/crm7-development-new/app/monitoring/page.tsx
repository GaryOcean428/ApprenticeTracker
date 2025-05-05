import React from 'react';
import { Suspense } from 'react';

import { CacheMetricsDashboard } from '@/components/monitoring/CacheMetricsDashboard';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata = {
  title: 'System Monitoring',
  description: 'Monitor system performance, caching, and health metrics',
};

function LoadingMetrics(): React.JSX.Element {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <Skeleton className="mb-4 h-4 w-1/3" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-2/3" />
        </div>
      </Card>
    </div>
  );
}

export default function MonitoringPage(): React.ReactElement {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">System Monitoring</h1>
        <p className="mt-2 text-muted-foreground">
          Monitor system performance, caching, and health metrics in real-time
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Cache Performance</h2>
            <div className="text-sm text-muted-foreground">Updates every second</div>
          </div>

          <Suspense fallback={<LoadingMetrics />}>
            <CacheMetricsDashboard />
          </Suspense>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">System Health</h2>
            <div className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="p-4">
              <h3 className="mb-2 text-lg font-semibold">API Response Times</h3>
              <div className="text-2xl font-bold">124ms</div>
              <div className="text-sm text-muted-foreground">Average over last hour</div>
            </Card>

            <Card className="p-4">
              <h3 className="mb-2 text-lg font-semibold">Error Rate</h3>
              <div className="text-2xl font-bold text-green-600">0.02%</div>
              <div className="text-sm text-muted-foreground">Last 24 hours</div>
            </Card>

            <Card className="p-4">
              <h3 className="mb-2 text-lg font-semibold">Memory Usage</h3>
              <div className="text-2xl font-bold">2.1 GB</div>
              <div className="text-sm text-muted-foreground">Of 4 GB allocated</div>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
