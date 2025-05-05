// filepath: /home/braden/Desktop/Dev/crm7r/lib/auth/supabase-utils.ts
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Utility functions to handle type issues with Supabase queries
 */

/**
 * Creates a type-safe query for user_roles table
 * @param supabase Supabase client instance
 * @returns A query builder with proper typing
 */
export function userRolesQuery(supabase: SupabaseClient<import('@/lib/database.types').Database>) {
  return supabase.from('user_roles') as unknown as {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        eq: (column: string, value: string) => {
          maybeSingle: () => Promise<{
            data: { role: string } | null;
            error: unknown;
          }>;
        };
        maybeSingle: () => Promise<{
          data: { role: string } | null;
          error: unknown;
        }>;
      };
    };
  };
}

/**
 * Creates a type-safe query for user_organizations table
 * @param supabase Supabase client instance
 * @returns A query builder with proper typing
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function userOrganizationsQuery(supabase: SupabaseClient<import('@/lib/database.types').Database>) {
  return supabase.from('user_organizations') as unknown as {
    select: (columns: string) => {
      eq: (column: string, value: string) => Promise<{
        data: Array<{
          organization_id: string;
          organization: { name: string };
        }> | null;
        error: unknown;
      }>;
    };
  };
}
