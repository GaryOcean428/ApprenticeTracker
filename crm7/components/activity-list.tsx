import { cn } from '@/lib/utils';

export interface Activity {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  status?: 'completed' | 'pending' | 'failed';
}

export interface ActivityListProps {
  title: string;
  activities: Activity[];
  className?: string;
}

function ActivityList({ title, activities, className }: ActivityListProps): JSX.Element {
  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="space-y-2">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center justify-between">
            <div>
              <p className="font-medium">{activity.title}</p>
              {activity.description && (
                <p className="text-sm text-muted-foreground">{activity.description}</p>
              )}
            </div>
            <time className="text-sm text-muted-foreground">{activity.timestamp}</time>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ActivityList;
