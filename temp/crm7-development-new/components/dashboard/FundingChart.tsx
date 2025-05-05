'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { type FundingData } from '@/types/funding';
import { Chart, type ChartConfiguration } from 'chart.js/auto';

interface FundingChartProps {
  data: FundingData[];
}

export function FundingChart({ data }: FundingChartProps) {
  const chartRef = React.useRef<HTMLCanvasElement>(null);
  const chartInstance = React.useRef<Chart | null>(null);

  React.useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: data.map(d => d.date),
        datasets: [{
          label: 'Funding Amount',
          data: data.map(d => d.amount),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    };

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, config);

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Funding Overview</h2>
      <canvas ref={chartRef} />
    </Card>
  );
}
