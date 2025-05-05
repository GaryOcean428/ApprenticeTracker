import { type Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@radix-ui/react-icons';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';

export const metadata: Metadata = {
  title: 'Training Courses',
  description: 'Manage and view available training courses',
};

const data = [
  {
    id: '1',
    title: 'Workplace Safety Fundamentals',
    category: 'Safety',
    duration: '2 hours',
    enrolled: 45,
    status: 'Active',
  },
  {
    id: '2',
    title: 'Leadership Skills 101',
    category: 'Management',
    duration: '4 hours',
    enrolled: 23,
    status: 'Draft',
  },
  // Add more mock data as needed
];

export default function TrainingCoursesPage() {
  return (
    <ErrorBoundary>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Training Courses</h1>
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            New Course
          </Button>
        </div>

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
            <CardTitle>Course Catalog</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={data} />
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
}
