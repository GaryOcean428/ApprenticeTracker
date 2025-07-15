import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface Alert {
  id: string;
  type: 'High' | 'Medium' | 'Low';
  message: string;
  date: string;
}

const alertStyles = {
  High: 'bg-destructive/10 text-destructive border-destructive',
  Medium: 'bg-warning/10 text-warning border-warning',
  Low: 'bg-info/10 text-info border-info',
} as const;

export default function ComplianceAlerts(): JSX.Element {
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['/api/compliance/alerts'],
    queryFn: async () => {
      // For demo purposes, returning mock data
      return [
        {
          id: '1',
          type: 'High',
          message: 'Missing required documentation for apprentice onboarding',
          date: '2024-04-28',
        },
        {
          id: '2',
          type: 'Medium',
          message: 'Incomplete risk assessment form for XYZ Construction',
          date: '2024-04-26',
        },
        {
          id: '3',
          type: 'Low',
          message: 'Pending annual review for apprentice John Smith',
          date: '2024-04-25',
        },
      ] as Alert[];
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {alerts?.map(alert => (
              <div
                key={alert.id}
                className={`flex items-center justify-between space-x-4 rounded-lg border p-4 ${alertStyles[alert.type]}`}
              >
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{alert.message}</p>
                  <p className="text-sm opacity-70">Due: {alert.date}</p>
                </div>
                <div className="rounded-full px-2 py-1 text-xs border">{alert.type}</div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Document Storage</h3>
            <p className="text-sm text-muted-foreground">
              Manage and store compliance-related documents with version control.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Automated Monitoring</h3>
            <p className="text-sm text-muted-foreground">
              Continuously monitor compliance requirements and statuses.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Audit Trail</h3>
            <p className="text-sm text-muted-foreground">
              Maintain a detailed log of compliance-related activities and changes.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
