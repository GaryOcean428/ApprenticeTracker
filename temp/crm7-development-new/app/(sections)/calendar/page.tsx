import { type Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@radix-ui/react-icons';

export const metadata: Metadata = {
  title: 'Calendar',
  description: 'View and manage calendar events',
};

export default function CalendarPage() {
  return (
    <ErrorBoundary>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Calendar</h1>
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Event
          </Button>
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
              <CardTitle>Total Events</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">45</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
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
                    <p className="font-medium">Team Meeting</p>
                    <p className="text-sm text-muted-foreground">09:00 - 10:00</p>
                  </div>
                  <div className="text-sm">8 Attendees</div>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">Client Review</p>
                    <p className="text-sm text-muted-foreground">14:00 - 15:00</p>
                  </div>
                  <div className="text-sm">4 Attendees</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  );
}