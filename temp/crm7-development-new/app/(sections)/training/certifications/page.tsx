import { type Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@radix-ui/react-icons';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const metadata: Metadata = {
  title: 'Training Certifications',
  description: 'Manage employee certifications and compliance',
};

const data = [
  {
    id: '1',
    name: 'John Doe',
    certification: 'Workplace Safety Certificate',
    issuedDate: '2024-08-15',
    expiryDate: '2025-08-15',
    status: 'Active',
  },
  {
    id: '2',
    name: 'Jane Smith',
    certification: 'First Aid Certification',
    issuedDate: '2024-06-01',
    expiryDate: '2025-06-01',
    status: 'Expiring Soon',
  },
  // Add more mock data as needed
];

export default function CertificationsPage() {
  return (
    <ErrorBoundary>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Certifications</h1>
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Certification
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Active Certifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">142</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Expiring Soon</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold text-yellow-600">12</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Expired</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold text-red-600">3</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Certification Records</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable columns={columns} data={data} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expiring" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Expiring Certifications</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={columns}
                  data={data.filter((item) => item.status === 'Expiring Soon')}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expired" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Expired Certifications</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={columns}
                  data={data.filter((item) => item.status === 'Expired')}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundary>
  );
}
