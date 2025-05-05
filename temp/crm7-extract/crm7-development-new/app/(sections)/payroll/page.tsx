import { type Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';

export const metadata: Metadata = {
  title: 'Payroll',
  description: 'Payroll management and processing',
};

export default function PayrollPage() {
  return (
    <ErrorBoundary>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Payroll</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total Payroll</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">$0.00</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">0</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next Pay Run</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">--/--/----</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  );
}