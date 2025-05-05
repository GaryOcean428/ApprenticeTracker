import { type Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { FileIcon } from '@radix-ui/react-icons';
import { DataTable } from '@/components/ui/data-table';

export const metadata: Metadata = {
  title: 'Payroll Reports',
  description: 'View and generate payroll reports',
};

const mockData = [
  {
    id: '1',
    name: 'Monthly Payroll Summary',
    period: 'February 2025',
    type: 'Summary',
    status: 'Generated',
    date: '2025-02-28',
  },
  {
    id: '2',
    name: 'Quarterly Tax Report',
    period: 'Q1 2025',
    type: 'Tax',
    status: 'Pending',
    date: '2025-03-31',
  },
];

const columns = [
  {
    accessorKey: 'name',
    header: 'Report Name',
  },
  {
    accessorKey: 'period',
    header: 'Period',
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
    accessorKey: 'date',
    header: 'Date',
  },
];

export default function PayrollReportsPage() {
  return (
    <ErrorBoundary>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Payroll Reports</h1>
          <Button>
            <FileIcon className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Available Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">8</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Generated This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">3</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">2</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={mockData} />
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
}