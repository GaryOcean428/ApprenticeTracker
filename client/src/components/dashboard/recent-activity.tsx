import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { User, FileText, AlertTriangle, Check } from 'lucide-react';
import type { ActivityLog } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ActivityItemProps {
  icon: React.ReactNode;
  iconBackground: string;
  title: string;
  timestamp: string;
}

const ActivityItem = ({ icon, iconBackground, title, timestamp }: ActivityItemProps) => {
  return (
    <li className="py-3">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span
            className={`w-8 h-8 flex items-center justify-center rounded-full ${iconBackground}`}
          >
            {icon}
          </span>
        </div>
        <div className="ml-3 w-0 flex-1">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{timestamp}</p>
        </div>
      </div>
    </li>
  );
};

const getActivityIcon = (action: string) => {
  switch (action) {
    case 'created':
    case 'registered':
      return {
        icon: <User className="h-4 w-4" />,
        bg: 'bg-primary-100 text-primary',
      };
    case 'approved':
    case 'updated':
      return {
        icon: <FileText className="h-4 w-4" />,
        bg: 'bg-secondary-100 text-secondary',
      };
    case 'warning':
      return {
        icon: <AlertTriangle className="h-4 w-4" />,
        bg: 'bg-yellow-100 text-warning',
      };
    case 'completed':
      return {
        icon: <Check className="h-4 w-4" />,
        bg: 'bg-green-100 text-success',
      };
    default:
      return {
        icon: <FileText className="h-4 w-4" />,
        bg: 'bg-muted text-muted-foreground',
      };
  }
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMilliseconds = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
  const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 60) {
    return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes} minutes ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffInDays < 2) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
};

const RecentActivity = () => {
  const {
    data: activities,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['/api/activities/recent'],
    queryFn: async () => {
      const res = await fetch('/api/activities/recent?limit=4');
      if (!res.ok) throw new Error('Failed to fetch activities');
      return res.json() as Promise<ActivityLog[]>;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start">
                <Skeleton className="h-8 w-8 rounded-full mr-3" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Failed to load activities</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden">
          <ul className="divide-y divide-border">
            {activities?.map(activity => {
              const { icon, bg } = getActivityIcon(activity.action);
              return (
                <ActivityItem
                  key={activity.id}
                  icon={icon}
                  iconBackground={bg}
                  title={
                    (activity.details?.message as string) ||
                    `${activity.action} ${activity.relatedTo}`
                  }
                  timestamp={formatTimestamp(activity.timestamp.toString())}
                />
              );
            })}
          </ul>
          <div className="mt-4">
            <Link href="/activities" className="text-sm font-medium text-primary hover:underline">
              View all activity
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
