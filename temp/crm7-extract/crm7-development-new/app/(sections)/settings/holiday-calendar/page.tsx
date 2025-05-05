import { type Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@radix-ui/react-icons';
import { DataTable } from '@/components/ui/data-table';
import { Calendar } from '@/components/ui/calendar';

export const metadata: Metadata = {
  title: 'Holiday & Calendar Settings',
  description: 'Configure holidays and calendar settings',
};

const mockData = [
  {
    id: '1',
    name: 'New Year\'s Day',
    date: '2025-01-01',
    type: 'Public Holiday',
    status: 'Active',
  },
  {
    id: '2',
    name: 'Australia Day',
    date: '2025-01-26',
    type: 'Public Holiday',
    status: 'Active',
  },
];

const columns = [
  {
    accessorKey: 'name',
    header: 'Holiday Name',
  },
  {
    accessorKey: 'date',
    header: 'Date',
  },
  {
    accessorKey: 'type',
    header: 'Type',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
];

export default function HolidayCalendarPage() {
  return (
    <ErrorBoundary>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Holiday & Calendar Settings</h1>
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Holiday
          </Button>
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
              <CardTitle>Holiday Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Public Holidays</span>
                  <span className="font-semibold">11</span>
                </div>
                <div className="flex justify-between">
                  <span>Company Holidays</span>
                  <span className="font-semibold">3</span>
                </div>
                <div className="flex justify-between">
                  <span>Next Holiday</span>
                  <span className="font-semibold">2025-01-01</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Holiday List</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={mockData} />
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
}