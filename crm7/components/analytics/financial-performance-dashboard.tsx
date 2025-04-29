'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Performance, PerformanceStats } from '@/lib/types';

export function FinancialPerformanceDashboard(): React.ReactElement {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [stats, setStats] = useState<PerformanceStats>({
    revenue: 0,
    growth: 0,
    margin: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const { data, error } = await supabase.from('financial_performances').select('*');
        
        if (error) throw error;
        
        setPerformances(data as Performance[]);
        calculateStats(data as Performance[]);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch performance data'));
      } finally {
        setIsLoading(false);
      }
    };

    void fetchData();
  }, [supabase]);

  if (isLoading) {
    return <div>Loading performance data...</div>;
  }

  if (error) {
    return <div>Error loading performance data: {error.message}</div>;
  }

  const formatPercent = (value: number): string => {
    return new Intl.NumberFormat('en-AU', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(amount);
  };

  const calculateStats = (performances: Performance[]): void => {
    if (performances.length === 0) {
      setStats({ revenue: 0, growth: 0, margin: 0 });
      return;
    }

    const latestPerformance = performances[performances.length - 1];
    setStats({
      revenue: latestPerformance.revenue,
      growth: latestPerformance.growth,
      margin: latestPerformance.margin
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-4 bg-card rounded-lg shadow">
          <h3 className="text-lg font-medium">Revenue</h3>
          <p className="text-2xl font-bold">{formatCurrency(stats.revenue)}</p>
        </div>
        <div className="p-4 bg-card rounded-lg shadow">
          <h3 className="text-lg font-medium">Growth</h3>
          <p className="text-2xl font-bold">{formatPercent(stats.growth)}</p>
        </div>
        <div className="p-4 bg-card rounded-lg shadow">
          <h3 className="text-lg font-medium">Margin</h3>
          <p className="text-2xl font-bold">{formatPercent(stats.margin)}</p>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow">
        <h3 className="p-4 text-lg font-medium border-b">Performance History</h3>
        <div className="divide-y">
          {performances.map((performance) => (
            <div key={performance.id} className="p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{performance.period}</p>
                <p className={`text-sm ${
                  performance.status === 'approved' ? 'text-green-600' :
                  performance.status === 'submitted' ? 'text-blue-600' :
                  'text-yellow-600'
                }`}>
                  {performance.status.charAt(0).toUpperCase() + performance.status.slice(1)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatCurrency(performance.revenue)}</p>
                <p className={`text-sm ${performance.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercent(performance.growth)} growth
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
