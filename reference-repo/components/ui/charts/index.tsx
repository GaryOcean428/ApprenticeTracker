'use client';

import { Bar, Line, Pie } from 'react-chartjs-2';

export const BarChart = Bar;
export const LineChart = Line;
export const PieChart = Pie;

export interface ChartContainerProps {
  children: React.ReactNode;
  width?: number;
  height?: number;
}

export function ChartContainer({ 
  children, 
  width = 600, 
  height = 400 
}: ChartContainerProps): JSX.Element {
  return (
    <div style={{ width, height }} className="relative">
      {children}
    </div>
  );
}

export function getChartGradient(ctx: CanvasRenderingContext2D, color: string): CanvasGradient {
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  return gradient;
}

export function getResponsiveFontSize(width: number): number {
  return Math.max(12, Math.min(16, width / 50));
}

export const chartColors = [
  '#4F46E5', // Indigo
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
];
