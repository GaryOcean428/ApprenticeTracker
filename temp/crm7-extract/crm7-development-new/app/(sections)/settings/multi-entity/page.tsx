import { type Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@radix-ui/react-icons';
import { DataTable } from '@/components/ui/data-table';

export const metadata: Metadata = {
  title: 'Multi-Entity Settings',
  description: 'Configure branch and entity settings',
};

const mockData = [
  {
    id: '1',
    name: 'Sydney Branch',
    type: 'Branch',
    location: 'Sydney, NSW',
    employees: 45,
    status: 'Active',
  },
  {
    id: '2',
    name: 'Melbourne Office',
    type: 'Branch',
    location: 'Melbourne, VIC',
    employees: 32,
    status: 'Active',
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
    accessorKey: 'location',
    header: 'Location',
  },
  {
    accessorKey: 'employees',
    header: 'Employees',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
];

export default function MultiEntityPage() {
  return (
    <ErrorBoundary>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Multi-Entity Settings</h1>
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Entity
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total Entities</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">5</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">156</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Locations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">8</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Entities</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={mockData} />
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
}