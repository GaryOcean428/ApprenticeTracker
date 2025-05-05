import { type Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@radix-ui/react-icons';
import { DataTable } from '@/components/ui/data-table';

export const metadata: Metadata = {
  title: 'Permissions & Roles',
  description: 'Manage system roles and permissions',
};

const mockData = [
  {
    id: '1',
    name: 'Administrator',
    users: 5,
    permissions: 'Full Access',
    lastModified: '2025-03-01',
    status: 'Active',
  },
  {
    id: '2',
    name: 'HR Manager',
    users: 8,
    permissions: 'HR & Personnel',
    lastModified: '2025-02-28',
    status: 'Active',
  },
];

const columns = [
  {
    accessorKey: 'name',
    header: 'Role Name',
  },
  {
    accessorKey: 'users',
    header: 'Users',
  },
  {
    accessorKey: 'permissions',
    header: 'Permissions',
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

export default function PermissionsPage() {
  return (
    <ErrorBoundary>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Permissions & Roles</h1>
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Role
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">8</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">3</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Changes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">5</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={mockData} />
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
}