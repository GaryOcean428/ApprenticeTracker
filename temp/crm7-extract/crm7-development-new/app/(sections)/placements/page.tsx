import { type Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';

export const metadata: Metadata = {
  title: 'Placements & Rosters',
  description: 'Manage placements and shift patterns',
};

export default function PlacementsPage() {
  return (
    <ErrorBoundary>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Placements & Rosters</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Active Placements</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">0</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Shifts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">0</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Open Positions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">0</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  );
}