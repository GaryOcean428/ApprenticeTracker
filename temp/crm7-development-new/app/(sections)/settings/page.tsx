import { type Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'System settings and configuration',
};

const settingsCategories = [
  {
    title: 'Holiday & Calendar Settings',
    href: '/settings/holiday-calendar',
    description: 'Configure holidays and calendar settings',
  },
  {
    title: 'Tax & Super Settings',
    href: '/settings/tax-super',
    description: 'Manage tax and superannuation configurations',
  },
  {
    title: 'Audit Logs',
    href: '/settings/audit-logs',
    description: 'View system audit logs and changes',
  },
  {
    title: 'Notification Templates',
    href: '/settings/notification-templates',
    description: 'Manage notification templates',
  },
  {
    title: 'Help & Documentation',
    href: '/settings/help-docs',
    description: 'Manage contextual help and documentation',
  },
  {
    title: 'Multi-Entity Settings',
    href: '/settings/multi-entity',
    description: 'Configure branch and entity settings',
  },
];

export default function SettingsPage() {
  return (
    <ErrorBoundary>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {settingsCategories.map((category) => (
            <Link key={category.href} href={category.href}>
              <Card className="hover:bg-accent cursor-pointer transition-colors">
                <CardHeader>
                  <CardTitle>{category.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </ErrorBoundary>
  );
}