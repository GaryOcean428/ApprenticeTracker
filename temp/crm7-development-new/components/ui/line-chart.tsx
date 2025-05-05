'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface LineChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
    }>;
  };
}

export function LineChart({ data }: LineChartProps): JSX.Element {
  return (
    <Line
      data={data}
      options={{
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Chart.js Line Chart' },
        },
      }}
    />
  );
}
