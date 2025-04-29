import { type Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@radix-ui/react-icons';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const metadata: Metadata = {
  title: 'Training Assessments',
  description: 'Manage and track training assessments',
};

const data = [
  {
    id: '1',
    title: 'Safety Protocol Assessment',
    course: 'Workplace Safety Fundamentals',
    dueDate: '2025-03-01',
    submissions: 32,
    status: 'Active',
  },
  {
    id: '2',
    title: 'Leadership Skills Evaluation',
    course: 'Leadership Skills 101',
    dueDate: '2025-02-28',
    submissions: 15,
    status: 'Draft',
  },
  // Add more mock data as needed
];

export default function TrainingAssessmentsPage() {
  return (
    <ErrorBoundary>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Training Assessments</h1>
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            New Assessment
          </Button>
        </div>

        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Active Assessments</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">8</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pending Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">24</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Average Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">85%</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Current Assessments</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable columns={columns} data={data} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Assessments</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable columns={columns} data={[]} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Completed Assessments</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable columns={columns} data={[]} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundary>
  );
}
