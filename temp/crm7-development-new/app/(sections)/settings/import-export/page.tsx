import { type Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { UploadIcon, DownloadIcon } from '@radix-ui/react-icons';
import { DataTable } from '@/components/ui/data-table';

export const metadata: Metadata = {
  title: 'Import/Export',
  description: 'Manage data imports and exports',
};

const mockData = [
  {
    id: '1',
    name: 'Employee Data Import',
    type: 'Import',
    status: 'Completed',
    records: 150,
    date: '2025-03-01',
  },
  {
    id: '2',
    name: 'Payroll Export',
    type: 'Export',
    status: 'Processing',
    records: 200,
    date: '2025-03-01',
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
    accessorKey: 'records',
    header: 'Records',
  },
  {
    accessorKey: 'date',
    header: 'Date',
  },
];

export default function ImportExportPage() {
  return (
    <ErrorBoundary>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Import/Export</h1>
          <div className="flex gap-4">
            <Button variant="outline">
              <UploadIcon className="mr-2 h-4 w-4" />
              Import Data
            </Button>
            <Button>
              <DownloadIcon className="mr-2 h-4 w-4" />
              Export Data
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">24</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Records Processed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">1,234</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">2</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Operations</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={mockData} />
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
}