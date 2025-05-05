'use client';

import { AlertTriangleIcon, InfoIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DashboardAlert } from '@/types/dashboard';

interface AlertsSectionProps {
  alerts: DashboardAlert[];
}

export function AlertsSection({ alerts }: AlertsSectionProps): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Recent Alerts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`flex items-start space-x-4 rounded-lg border p-4 ${
              alert.severity === 'high'
                ? 'border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20'
                : 'border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-900/20'
            }`}
          >
            <div
              className={`mt-0.5 rounded-full p-1 ${
                alert.severity === 'high'
                  ? 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400'
                  : 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
              }`}
            >
              {alert.severity === 'high' ? (
                <AlertTriangleIcon className="h-4 w-4" />
              ) : (
                <InfoIcon className="h-4 w-4" />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <p className={`text-sm font-medium ${
                alert.severity === 'high'
                  ? 'text-red-900 dark:text-red-400'
                  : 'text-blue-900 dark:text-blue-400'
              }`}>
                {alert.title}
              </p>
              <p className="text-sm text-muted-foreground">
                {alert.description}
              </p>
            </div>
          </div>
        ))}
        {alerts.length === 0 && (
          <p className="text-sm text-muted-foreground">No active alerts</p>
        )}
      </CardContent>
    </Card>
  );
}
