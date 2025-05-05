import { type Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@radix-ui/react-icons';
import { DataTable } from '@/components/ui/data-table';

export const metadata: Metadata = {
  title: 'Shift Patterns',
  description: 'Manage and configure shift patterns',
};

const mockData = [
  {
    id: '1',
    name: 'Morning Shift',
    startTime: '06:00',
    endTime: '14:00',
    days: 'Mon-Fri',
    status: 'Active',
  },
  {
    id: '2',
    name: 'Afternoon Shift',
    startTime: '14:00',
    endTime: '22:00',
    days: 'Mon-Fri',
    status: 'Active',
  },
];

const columns = [
  {
    accessorKey: 'name',
    header: 'Pattern Name',
  },
  {
    accessorKey: 'startTime',
    header: 'Start Time',
  },
  {
    accessorKey: 'endTime',
    header: 'End Time',
  },
  {
    accessorKey: 'days',
    header: 'Days',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
];

export default function ShiftPatternsPage() {
  return (
    <ErrorBoundary>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Shift Patterns</h1>
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Pattern
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Active Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">6</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">168</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assigned Staff</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">24</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Shift Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={mockData} />
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
}