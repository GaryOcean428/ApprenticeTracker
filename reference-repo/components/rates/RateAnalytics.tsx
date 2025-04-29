'use client';

import { useState, useEffect } from 'react';
import type { AnalyticsData } from '@/lib/types/rates';
import { ratesService } from '@/lib/services/rates';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { Alert } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

interface RateAnalyticsProps {
  orgId: string;
}

export function RateAnalytics({ orgId }: RateAnalyticsProps): JSX.Element {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadAnalytics = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        const result = await ratesService.getAnalytics({ orgId });
        if (mounted) {
          setAnalytics(result.data);
        }
      } catch (err) {
        if (mounted) {
          const errMsg = err instanceof Error ? err.message : 'An error occurred';
          setError(errMsg);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadAnalytics();

    return () => {
      mounted = false;
    };
  }, [orgId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return <Alert variant="destructive">{error}</Alert>;
  }

  if (!analytics) {
    return <Alert>No analytics data available</Alert>;
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Rate Analytics</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-2 text-lg font-semibold">Average Rate</h3>
            <p className="text-3xl font-bold">${analytics.averageRate.toFixed(2)}</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-2 text-lg font-semibold">Templates</h3>
            <p className="text-sm">
              Active: {analytics.activeTemplates} / Total: {analytics.totalTemplates}
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-2 text-lg font-semibold">Recent Changes</h3>
            <div className="space-y-2">
              {analytics.recentChanges.slice(0, 3).map((change: { action: string; timestamp: string }, index: number) => (
                <p key={index} className="text-sm">
                  {change.action} on {new Date(change.timestamp).toLocaleDateString()}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
