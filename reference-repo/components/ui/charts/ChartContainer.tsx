'use client';

import * as React from 'react';

interface ChartContainerProps {
  children: React.ReactNode;
  width?: number;
  height?: number;
}

export function ChartContainer({ children, width = 600, height = 400 }: ChartContainerProps): JSX.Element {
  return <div style={{ width, height }} className="relative">{children}</div>;
}
