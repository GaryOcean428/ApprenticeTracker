import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface FairWorkUpdateNotificationProps {
  onUpdateClick?: () => void;
  onDismiss?: () => void;
}

interface AwardUpdate {
  id: string;
  awardCode: string;
  awardName: string;
  currentVersion: string;
  latestVersion: string;
  updateUrl: string | null;
  checkDate: string;
}

export default function FairWorkUpdateNotification({
  onUpdateClick,
  onDismiss,
}: FairWorkUpdateNotificationProps) {
  const { toast } = useToast();
  const [dismissed, setDismissed] = useState(false);

  // Query for award updates with status "notified"
  const {
    data: awardUpdates,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['/api/fairwork/award-updates', 'notified'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/fairwork/award-updates?status=notified');
      return await response.json();
    },
    retry: false,
  });

  // Only show notification if there are updates and it hasn't been dismissed
  if (
    dismissed ||
    isLoading ||
    !awardUpdates ||
    !awardUpdates.data ||
    awardUpdates.data.length === 0
  ) {
    return null;
  }

  // Group the updates by new awards vs. updates to existing awards
  const newAwards = awardUpdates.data.filter((u: any) => u.currentVersion === 'Not in system');
  const updatedAwards = awardUpdates.data.filter((u: any) => u.currentVersion !== 'Not in system');

  // If there are no updates in either category, don't show the notification
  if (newAwards.length === 0 && updatedAwards.length === 0) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  const handleUpdateClick = () => {
    if (onUpdateClick) {
      onUpdateClick();
    }
  };

  return (
    <Card className="mb-6 border-amber-400 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <CardTitle className="text-amber-800 dark:text-amber-300">
              Fair Work Award Updates Available
            </CardTitle>
          </div>
          <Badge
            variant="outline"
            className="bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200"
          >
            {newAwards.length + updatedAwards.length} update
            {newAwards.length + updatedAwards.length > 1 ? 's' : ''}
          </Badge>
        </div>
        <CardDescription className="text-amber-700 dark:text-amber-400">
          New information is available for the following awards
        </CardDescription>
      </CardHeader>
      <CardContent>
        {newAwards.length > 0 && (
          <div className="mb-3">
            <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-1">New Awards</h4>
            <ul className="pl-5 list-disc text-amber-700 dark:text-amber-400">
              {newAwards.map(award => (
                <li key={award.id} className="mb-1">
                  <span className="font-medium">{award.awardCode}</span>: {award.awardName}
                </li>
              ))}
            </ul>
          </div>
        )}

        {updatedAwards.length > 0 && (
          <div>
            <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-1">Updated Awards</h4>
            <ul className="pl-5 list-disc text-amber-700 dark:text-amber-400">
              {updatedAwards.map(award => (
                <li key={award.id} className="mb-1">
                  <span className="font-medium">{award.awardCode}</span>: {award.awardName}
                  <span className="text-xs ml-1">
                    (v{award.currentVersion} → v{award.latestVersion})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-0">
        <Button
          variant="outline"
          className="text-amber-600 border-amber-600 hover:bg-amber-100 dark:text-amber-400 dark:border-amber-600 dark:hover:bg-amber-900"
          onClick={handleDismiss}
        >
          Dismiss
        </Button>
        <Button
          className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600"
          onClick={handleUpdateClick}
        >
          Update Awards
        </Button>
      </CardFooter>
    </Card>
  );
}

function RefreshCw(props: React.SVGAttributes<SVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}
