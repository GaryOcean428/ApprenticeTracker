import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Activity {
  type: string;
  description: string;
  time: string;
}

const activities: Activity[] = [
  {
    type: 'Placement',
    description: 'John Smith placed at ABC Construction',
    time: '2 hours ago',
  },
  {
    type: 'Training',
    description: 'Safety induction completed for 12 apprentices',
    time: '4 hours ago',
  },
  {
    type: 'Compliance',
    description: 'Updated workplace agreements for XYZ Industries',
    time: '6 hours ago',
  },
  {
    type: 'Assessment',
    description: 'Quarterly reviews completed for electrical apprentices',
    time: '1 day ago',
  },
  {
    type: 'Document',
    description: 'New training plans uploaded for mechanical trades',
    time: '1 day ago',
  },
];

export function RecentActivity(): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="rounded-full bg-gray-100 p-2">
                <div className="h-2 w-2 rounded-full bg-gray-600" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">{activity.description}</p>
                <p className="text-sm text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
