import { type Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { PlusIcon, SearchIcon } from '@radix-ui/react-icons';
import { DataTable } from '@/components/ui/data-table';

export const metadata: Metadata = {
  title: 'Help & Documentation',
  description: 'Manage help content and documentation',
};

const mockData = [
  {
    id: '1',
    title: 'Getting Started Guide',
    category: 'Onboarding',
    lastUpdated: '2025-03-01',
    author: 'John Smith',
    status: 'Published',
  },
  {
    id: '2',
    title: 'Leave Management Guide',
    category: 'HR',
    lastUpdated: '2025-02-28',
    author: 'Jane Doe',
    status: 'Draft',
  },
];

const columns = [
  {
    accessorKey: 'title',
    header: 'Title',
  },
  {
    accessorKey: 'category',
    header: 'Category',
  },
  {
    accessorKey: 'lastUpdated',
    header: 'Last Updated',
  },
  {
    accessorKey: 'author',
    header: 'Author',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
];

export default function HelpDocsPage() {
  return (
    <ErrorBoundary>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Help & Documentation</h1>
          <div className="flex gap-4">
            <Button variant="outline">
              <SearchIcon className="mr-2 h-4 w-4" />
              Search Docs
            </Button>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Create Article
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">45</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">8</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Views</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">234</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Documentation</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={mockData} />
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
}