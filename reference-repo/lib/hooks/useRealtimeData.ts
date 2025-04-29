import { useState, useEffect } from 'react';
import { type RealtimeChannel } from '@supabase/supabase-js';
import { type Database } from '@/types/supabase';
import { createClient } from '@/lib/supabase/client';

interface UseRealtimeDataOptions<T> {
  filter?: Record<string, unknown>;
  onUpdate?: (data: T[]) => void;
}

export function useRealtimeData<T>(
  table: keyof Database['public']['Tables'],
  initialData: T[] = [],
  options: UseRealtimeDataOptions<T> = {}
): { data: T[]; error: Error | null; isLoading: boolean; } {
  const supabase = createClient();
  const [data, setData] = useState<T[]>(initialData);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let subscription: RealtimeChannel;

    const fetchData = async (): Promise<void> => {
      try {
        let query = supabase.from(table).select('*');

        if (options.filter) {
          Object.entries(options.filter).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }

        const { data: initialData, error: queryError } = await query;

        if (typeof queryError !== "undefined" && queryError !== null) {
          throw queryError;
        }

        setData(initialData as T[]);
        options.onUpdate?.(initialData as T[]);
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error('Failed to fetch data');
        setError(errorObj);
      } finally {
        setIsLoading(false);
      }
    };

    const setupSubscription = (): void => {
      subscription = supabase
        .channel(`${table}_changes`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table,
          },
          (): void => {
            void fetchData();
          }
        )
        .subscribe();
    };

    void fetchData();
    setupSubscription();

    return (): void => {
      subscription?.unsubscribe();
    };
  }, [table, options, supabase]);

  return { data, error, isLoading };
}
