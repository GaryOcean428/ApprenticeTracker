'use client';

import React from 'react';
import type { ReactElement } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { TrendChart } from '@/components/charts/trend-chart';

interface PlacementTrendsProps {
  data: {
    date: string;
    count: number;
  }[];
}

const PlacementTrends: React.FC<PlacementTrendsProps> = ({ data }): ReactElement => {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Placement Trends</h2>
      </CardHeader>
      <CardContent>
        <TrendChart data={data} />
      </CardContent>
    </Card>
  );
};

export default PlacementTrends;
