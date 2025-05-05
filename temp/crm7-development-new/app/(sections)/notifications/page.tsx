import { type Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { BellIcon, SettingsIcon } from '@radix-ui/react-icons';

export const metadata: Metadata = {
  title: 'Notifications',
  description: 'View and manage notifications',
};

const notifications = [
  {
    id: '1',
    title: 'Leave Request Approved',
    description: 'Your leave request for March 15-20 has been approved.',
    time: '10 minutes ago',
    type: 'success',
  },
  {
    id: '2',
    title: 'New Task Assigned',
    description: 'You have been assigned a new training assessment.',
    time: '1 hour ago',
    type: 'info',
  },
  {
    id: '3',
    title: 'Timesheet Due',
    description: 'Your timesheet for this week is due tomorrow.',
    time: '2 hours ago',
    type: 'warning',
  },
];

export default function NotificationsPage() {
  return (
    <ErrorBoundary>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Notifications</h1>
          <div className="flex gap-4">
            <Button variant="outline">
              <SettingsIcon className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button>
              <BellIcon className="mr-2 h-4 w-4" />
              Mark All Read
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Unread</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">3</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Today</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">8</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">24</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start justify-between border-b pb-4"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {notification.description}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {notification.time}
                    </p>
                  </div>
                  <div className={`text-sm ${
                    notification.type === 'success' ? 'text-green-600' :
                    notification.type === 'warning' ? 'text-yellow-600' :
                    'text-blue-600'
                  }`}>
                    {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
}