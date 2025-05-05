import { type Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@radix-ui/react-icons';
import { DataTable } from '@/components/ui/data-table';

export const metadata: Metadata = {
  title: 'Roster Management',
  description: 'Manage staff rosters and schedules',
};

const mockData = [
  {
    id: '1',
    employee: 'John Smith',
    shift: 'Morning Shift',
    date: '2025-03-01',
    startTime: '06:00',
    endTime: '14:00',
    status: 'Confirmed',
  },
  {
    id: '2',
    employee: 'Jane Doe',
    shift: 'Afternoon Shift',
    date: '2025-03-01',
    startTime: '14:00',
    endTime: '22:00',
    status: 'Pending',
  },
];

const columns = [
  {
    accessorKey: 'employee',
    header: 'Employee',
  },
  {
    accessorKey: 'shift',
    header: 'Shift',
  },
  {
    accessorKey: 'date',
    header: 'Date',
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
    accessorKey: 'status',
    header: 'Status',
  },
];

export default function RosterManagementPage() {
  return (
    <ErrorBoundary>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Roster Management</h1>
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Shift
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Today's Shifts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">12</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Staff On Duty</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">8</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Changes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">3</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Current Roster</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={mockData} />
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
}