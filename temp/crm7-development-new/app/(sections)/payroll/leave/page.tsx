import { type Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@radix-ui/react-icons';
import { DataTable } from '@/components/ui/data-table';

export const metadata: Metadata = {
  title: 'Leave Management',
  description: 'Manage employee leave and entitlements',
};

const mockData = [
  {
    id: '1',
    employeeName: 'John Doe',
    leaveType: 'Annual Leave',
    startDate: '2025-03-01',
    endDate: '2025-03-05',
    status: 'Approved',
  },
  {
    id: '2',
    employeeName: 'Jane Smith',
    leaveType: 'Sick Leave',
    startDate: '2025-03-10',
    endDate: '2025-03-11',
    status: 'Pending',
  },
];

const columns = [
  {
    accessorKey: 'employeeName',
    header: 'Employee',
  },
  {
    accessorKey: 'leaveType',
    header: 'Leave Type',
  },
  {
    accessorKey: 'startDate',
    header: 'Start Date',
  },
  {
    accessorKey: 'endDate',
    header: 'End Date',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
];

export default function LeaveManagementPage() {
  return (
    <ErrorBoundary>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Leave Management</h1>
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Request Leave
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Pending Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">3</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>On Leave Today</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">2</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Leave</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">5</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Leave Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={mockData} />
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
}