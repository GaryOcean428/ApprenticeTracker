import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { TimeEntry } from '@/types/time';
import { useToast } from '@/hooks/use-toast';

export function TimeEntriesList(): React.ReactElement {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await fetch('/api/time-entries');
        const data = await response.json();
        setEntries(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load time entries',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntries();
  }, [toast]);

  if (isLoading) {
    return <div>Loading time entries...</div>;
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <Card key={entry.id} className="p-4">
          <div className="flex justify-between">
            <div>
              <h3 className="font-medium">{entry.description}</h3>
              <p className="text-sm text-gray-500">{entry.project}</p>
            </div>
            <div className="text-right">
              <p className="font-medium">{format(new Date(entry.date), 'MMM d, yyyy')}</p>
              <p className="text-sm text-gray-500">{entry.duration} hours</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
