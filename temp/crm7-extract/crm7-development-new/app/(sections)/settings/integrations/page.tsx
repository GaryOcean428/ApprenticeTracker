import { type Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { PlusIcon, RefreshCwIcon } from '@radix-ui/react-icons';
import { DataTable } from '@/components/ui/data-table';

export const metadata: Metadata = {
  title: 'Integrations & API Manager',
  description: 'Manage system integrations and API connections',
};

const mockData = [
  {
    id: '1',
    name: 'Payroll System',
    type: 'API Integration',
    status: 'Connected',
    lastSync: '2025-03-01 10:30:00',
    health: 'Healthy',
  },
  {
    id: '2',
    name: 'Learning Management System',
    type: 'OAuth2',
    status: 'Connected',
    lastSync: '2025-03-01 10:15:00',
    health: 'Warning',
  },
];

const columns = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'type',
    header: 'Type',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
  {
    accessorKey: 'lastSync',
    header: 'Last Sync',
  },
  {
    accessorKey: 'health',
    header: 'Health',
  },
];

export default function IntegrationsPage() {
  return (
    <ErrorBoundary>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Integrations & API Manager</h1>
          <div className="flex gap-4">
            <Button variant="outline">
              <RefreshCwIcon className="mr-2 h-4 w-4" />
              Sync All
            </Button>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Integration
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Active Integrations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">8</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Calls Today</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">1,234</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-green-600">98%</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Connected Systems</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={mockData} />
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
}