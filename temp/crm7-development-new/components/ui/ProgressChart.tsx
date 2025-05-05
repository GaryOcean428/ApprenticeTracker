'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

interface ChartData {
  name: string;
  completed: number;
  inProgress: number;
}

const data: ChartData[] = [
  { name: 'Year 1', completed: 150, inProgress: 400 },
  { name: 'Year 2', completed: 200, inProgress: 350 },
  { name: 'Year 3', completed: 250, inProgress: 300 },
  { name: 'Year 4', completed: 300, inProgress: 200 },
];

export function ProgressChart(): JSX.Element {
  return (
    <div className='h-[300px] w-full'>
      <ResponsiveContainer
        width='100%'
        height='100%'
      >
        <BarChart
          data={data}
          stackOffset='expand'
        >
          <XAxis dataKey='name' />
          <YAxis />
          <Bar
            dataKey='inProgress'
            fill='#4ADE80'
            stackId='stack'
            name='In Progress'
          />
          <Bar
            dataKey='completed'
            fill='#3B82F6'
            stackId='stack'
            name='Completed'
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
