import { Card } from './card';

export interface Activity {
  title: string;
  description: string;
  date?: string;
}

export interface ActivityListProps {
  title: string;
  activities: Activity[];
  className?: string;
}

export function ActivityList({
  title,
  activities,
  className = '',
}: ActivityListProps): JSX.Element {
  return (
    <Card className={`p-4 ${className}`}>
      <h2 className="mb-4 text-xl font-semibold">{title}</h2>
      <div className="space-y-4">
        {activities.map((activity: Activity, index) => (
          <div key={index} className="border-b pb-2 last:border-0">
            <p className="font-medium">{activity.title}</p>
            <p className="text-sm text-muted-foreground">{activity.description}</p>
            {activity.date && <p className="mt-1 text-sm text-muted-foreground">{activity.date}</p>}
          </div>
        ))}
      </div>
    </Card>
  );
}
