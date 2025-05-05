import { type Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';

export const metadata: Metadata = {
  title: 'Pay Schedule Settings',
  description: 'Configure pay periods and schedules',
};

export default function PayScheduleSettingsPage() {
  return (
    <ErrorBoundary>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Pay Schedule Settings</h1>
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Pay Period Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Configure pay periods, cut-off dates, and publish dates.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  );
}