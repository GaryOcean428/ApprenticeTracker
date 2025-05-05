import { type Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { Calendar } from '@/components/ui/calendar';

export const metadata: Metadata = {
  title: 'Calendar View',
  description: 'View placements and shifts in calendar format',
};

export default function PlacementsCalendarPage() {
  return (
    <ErrorBoundary>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Calendar View</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Today's Events</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">5</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">12</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conflicts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-yellow-600">2</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={new Date()}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">Morning Shift</p>
                  <p className="text-sm text-muted-foreground">06:00 - 14:00</p>
                </div>
                <div className="text-sm">8 Staff Members</div>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">Afternoon Shift</p>
                  <p className="text-sm text-muted-foreground">14:00 - 22:00</p>
                </div>
                <div className="text-sm">6 Staff Members</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
}