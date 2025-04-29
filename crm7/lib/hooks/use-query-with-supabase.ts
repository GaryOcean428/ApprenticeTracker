import { useQuery, useInfiniteQuery, type UseQueryResult, type UseInfiniteQueryResult } from '@tanstack/react-query';
import { type SupabaseClient } from '@supabase/supabase-js';
import { type Database } from '@/types/supabase';

interface UseQueryWithSupabaseOptions<T> {
  select?: (data: T[]) => T[];
  staleTime?: number;
  pageSize?: number;
}

export function useQueryWithSupabase<T>(
  supabase: SupabaseClient<Database>,
  queryKey: string[],
  queryFn: () => Promise<{ data: T[]; error: Error | null }>,
  options?: UseQueryWithSupabaseOptions<T>
): UseQueryResult<T[], Error> {
  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const { data, error } = await queryFn();

        if (error) {
          throw error;
        }

        if (!data) {
          return [];
        }

        return options?.select ? options.select(data) : data;
      } catch (error) {
        console.error('Supabase query error:', error);
        throw error;
      }
    },
    staleTime: options?.staleTime,
  });
}

export function useInfiniteQueryWithSupabase<T>(
  supabase: SupabaseClient<Database>,
  queryKey: string[],
  queryFn: (from: number, to: number) => Promise<{ data: T[]; error: Error | null }>,
  options?: UseQueryWithSupabaseOptions<T>
): UseInfiniteQueryResult<T[], Error> {
  return useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 0 }) => {
      try {
        const { data, error } = await queryFn(
          Number(pageParam) * (options?.pageSize || 10),
          (Number(pageParam) + 1) * (options?.pageSize || 10) - 1
        );

        if (error) {
          throw error;
        }

        return {
          data: options?.select ? options.select(data || []) : data || [],
          nextPage: (data?.length ?? 0) === (options?.pageSize ?? 10) ? Number(pageParam) + 1 : undefined,
        };
      } catch (error) {
        console.error('Supabase infinite query error:', error);
        throw error;
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: options?.staleTime,
  });
}
