import { PieChart, Pie, ResponsiveContainer } from 'recharts';
import { type FundingData } from '@/types/funding';

interface FundingOverviewProps {
  data: FundingData[];
}

export function FundingOverview({ data }: FundingOverviewProps): JSX.Element {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            label={({ name, percent }): string => `${name} ${(percent * 100).toFixed(0)}%`}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
