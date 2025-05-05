import { type Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@radix-ui/react-icons';
import { DataTable } from '@/components/ui/data-table';

export const metadata: Metadata = {
  title: 'Pay Items & Awards',
  description: 'Manage pay items and award configurations',
};

const mockData = [
  {
    id: '1',
    name: 'Base Rate',
    type: 'Pay Item',
    category: 'Standard',
    status: 'Active',
  },
  {
    id: '2',
    name: 'Overtime Rate',
    type: 'Pay Item',
    category: 'Overtime',
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
    accessorKey: 'category',
    header: 'Category',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
];

export default function PayItemsPage() {
  return (
    <ErrorBoundary>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Pay Items & Awards</h1>
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Pay Item
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total Pay Items</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">12</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Awards</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">3</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">5</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pay Items</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={mockData} />
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
}