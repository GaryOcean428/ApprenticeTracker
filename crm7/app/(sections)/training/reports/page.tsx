import { type Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';

export const metadata: Metadata = {
  title: 'Training Reports',
  description: 'View and analyze training metrics and progress',
};

const data = [
  {
    id: '1',
    employee: 'John Doe',
    course: 'Safety Fundamentals',
    status: 'Completed',
    score: 95,
    completedAt: '2025-02-01',
  },
  {
    id: '2',
    employee: 'Jane Smith',
    course: 'Leadership Skills',
    status: 'In Progress',
    score: null,
    completedAt: null,
  },
  // Add more mock data as needed
];

export default function TrainingReportsPage() {
  return (
    <ErrorBoundary>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Training Reports</h1>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="completion">Completion Rates</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Total Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">24</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Learners</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">156</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">87%</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Training Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable columns={columns} data={data} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completion" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Course Completion Rates</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add completion rate charts/graphs here */}
                <p>Course completion visualization will be displayed here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add performance metrics charts/graphs here */}
                <p>Performance metrics visualization will be displayed here</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundary>
  );
}
