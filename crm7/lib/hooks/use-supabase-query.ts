import { useQuery, useMutation, type UseQueryResult, type UseMutationResult } from '@tanstack/react-query';
import { type SupabaseClient } from '@supabase/supabase-js';
import { type Database } from '@/types/supabase';

type TableName = keyof Database['public']['Tables'];

interface QueryOptions {
  filter?: Record<string, unknown>;
  select?: string;
}

export function useSupabaseQuery<T>(
  supabase: SupabaseClient<Database>,
  table: TableName,
  options?: QueryOptions
): UseQueryResult<T[], Error> {
  return useQuery({
    queryKey: [table, options?.filter],
    queryFn: async () => {
      try {
        const query = supabase.from(table).select(options?.select || '*');

        if (options?.filter) {
          Object.entries(options.filter).forEach(([column, value]) => {
            query.eq(column, value);
          });
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        return data as T[];
      } catch (error) {
        console.error('Supabase query error:', error);
        throw error;
      }
    },
  });
}

export function useSupabaseMutation<T>(
  supabase: SupabaseClient<Database>,
  table: TableName
): UseMutationResult<T, Error, { data: Record<string, unknown>; match?: Record<string, unknown> }> {
  return useMutation({
    mutationFn: async ({
      data,
      match,
    }: {
      data: Record<string, unknown>;
      match?: Record<string, unknown>;
    }) => {
      try {
        const query = supabase.from(table);

        if (match) {
          const { data: result, error } = await query.update(data).match(match);
          if (error) throw error;
          return result as T;
        } else {
          const { data: result, error } = await query.insert(data);
          if (error) throw error;
          return result as T;
        }
      } catch (error) {
        console.error('Supabase mutation error:', error);
        throw error;
      }
    },
  });
}
