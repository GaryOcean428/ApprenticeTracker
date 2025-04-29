'use client';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      data: number[];
      backgroundColor: string[];
      borderColor: string[];
      borderWidth: number;
    }>;
  };
}

export function PieChart({ data }: PieChartProps): JSX.Element {
  return (
    <Pie
      data={data}
      options={{ 
        responsive: true, 
        plugins: { 
          legend: { position: 'top' } 
        } 
      }}
    />
  );
}
