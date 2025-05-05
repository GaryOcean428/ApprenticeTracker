import { type Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { DownloadIcon } from '@radix-ui/react-icons';
import { DataTable } from '@/components/ui/data-table';

export const metadata: Metadata = {
  title: 'Payroll Export',
  description: 'Export payroll data and reports',
};

const mockData = [
  {
    id: '1',
    name: 'February 2025 Payroll',
    type: 'Payroll Data',
    format: 'CSV',
    status: 'Ready',
    generated: '2025-02-28',
  },
  {
    id: '2',
    name: 'January 2025 STP Report',
    type: 'STP Report',
    format: 'XML',
    status: 'Ready',
    generated: '2025-01-31',
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
    accessorKey: 'format',
    header: 'Format',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
  {
    accessorKey: 'generated',
    header: 'Generated',
  },
];

export default function PayrollExportPage() {
  return (
    <ErrorBoundary>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Payroll Export</h1>
          <Button>
            <DownloadIcon className="mr-2 h-4 w-4" />
            Generate Export
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Available Exports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">5</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Last Export</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">2025-02-28</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-green-600">Ready</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Exports</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={mockData} />
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
}