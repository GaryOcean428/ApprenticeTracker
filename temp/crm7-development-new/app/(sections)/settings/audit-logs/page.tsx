import { type Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { DataTable } from '@/components/ui/data-table';

export const metadata: Metadata = {
  title: 'Audit Logs',
  description: 'View system audit logs and changes',
};

const mockData = [
  {
    id: '1',
    timestamp: '2025-03-01 10:30:00',
    user: 'John Smith',
    action: 'Update Employee Record',
    details: 'Modified contact information',
    ip: '192.168.1.100',
  },
  {
    id: '2',
    timestamp: '2025-03-01 10:15:00',
    user: 'Jane Doe',
    action: 'Create Leave Request',
    details: 'Annual leave application',
    ip: '192.168.1.101',
  },
];

const columns = [
  {
    accessorKey: 'timestamp',
    header: 'Timestamp',
  },
  {
    accessorKey: 'user',
    header: 'User',
  },
  {
    accessorKey: 'action',
    header: 'Action',
  },
  {
    accessorKey: 'details',
    header: 'Details',
  },
  {
    accessorKey: 'ip',
    header: 'IP Address',
  },
];

export default function AuditLogsPage() {
  return (
    <ErrorBoundary>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Audit Logs</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total Events</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">1,234</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Today's Events</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">45</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">12</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={mockData} />
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
}