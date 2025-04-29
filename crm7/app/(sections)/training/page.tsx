import { type Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';

export const metadata: Metadata = {
  title: 'Training Dashboard',
  description: 'Training and development dashboard',
};

export default function TrainingDashboard() {
  return (
    <ErrorBoundary>
      <div className="container mx-auto p-6">
        <h1 className="mb-6 text-3xl font-bold">Training Dashboard</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Active Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">12</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">5</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Certifications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">8</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-2xl font-semibold">Recent Activity</h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {[
                  {
                    title: 'Workplace Safety Course Completed',
                    date: '2025-02-10',
                    type: 'completion',
                  },
                  {
                    title: 'New Assessment Available',
                    date: '2025-02-09',
                    type: 'assessment',
                  },
                  {
                    title: 'Certification Expiring Soon',
                    date: '2025-02-08',
                    type: 'alert',
                  },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-gray-500">{activity.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  );
}
