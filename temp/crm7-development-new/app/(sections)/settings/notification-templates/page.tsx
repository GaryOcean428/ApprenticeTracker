import { type Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@radix-ui/react-icons';
import { DataTable } from '@/components/ui/data-table';

export const metadata: Metadata = {
  title: 'Notification Templates',
  description: 'Manage notification templates and settings',
};

const mockData = [
  {
    id: '1',
    name: 'Leave Request Approval',
    type: 'Email',
    category: 'HR',
    lastModified: '2025-03-01',
    status: 'Active',
  },
  {
    id: '2',
    name: 'Timesheet Reminder',
    type: 'SMS',
    category: 'Payroll',
    lastModified: '2025-02-28',
    status: 'Active',
  },
];

const columns = [
  {
    accessorKey: 'name',
    header: 'Template Name',
  },
  {
    accessorKey: 'type',
    header: 'Type',
  },
  {
    accessorKey: 'category',
    header: 'Category',
  },
  {
    accessorKey: 'lastModified',
    header: 'Last Modified',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
];

export default function NotificationTemplatesPage() {
  return (
    <ErrorBoundary>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Notification Templates</h1>
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Template
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">15</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">12</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sent Today</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">156</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={mockData} />
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
}