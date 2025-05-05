import { type Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { RefreshCwIcon } from '@radix-ui/react-icons';
import { DataTable } from '@/components/ui/data-table';

export const metadata: Metadata = {
  title: 'Tax & Super Settings',
  description: 'Configure tax and superannuation settings',
};

const mockData = [
  {
    id: '1',
    name: 'Standard Tax Table',
    effectiveDate: '2025-07-01',
    status: 'Current',
    lastUpdated: '2025-06-15',
  },
  {
    id: '2',
    name: 'Super Guarantee Rate',
    effectiveDate: '2025-07-01',
    status: 'Current',
    lastUpdated: '2025-06-15',
  },
];

const columns = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'effectiveDate',
    header: 'Effective Date',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
  {
    accessorKey: 'lastUpdated',
    header: 'Last Updated',
  },
];

export default function TaxSuperPage() {
  return (
    <ErrorBoundary>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Tax & Super Settings</h1>
          <Button>
            <RefreshCwIcon className="mr-2 h-4 w-4" />
            Update Tables
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Current SG Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">11.0%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tax Year</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">2024-25</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Last Update</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">2025-06-15</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tax & Super Tables</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={mockData} />
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Tax Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Tax Scale Version</span>
                  <span className="font-semibold">2024-25.1</span>
                </div>
                <div className="flex justify-between">
                  <span>HELP/HECS Rate</span>
                  <span className="font-semibold">Current</span>
                </div>
                <div className="flex justify-between">
                  <span>Medicare Levy</span>
                  <span className="font-semibold">2.0%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Super Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Super Guarantee Rate</span>
                  <span className="font-semibold">11.0%</span>
                </div>
                <div className="flex justify-between">
                  <span>Super Payment Frequency</span>
                  <span className="font-semibold">Quarterly</span>
                </div>
                <div className="flex justify-between">
                  <span>Default Super Fund</span>
                  <span className="font-semibold">AustralianSuper</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  );
}