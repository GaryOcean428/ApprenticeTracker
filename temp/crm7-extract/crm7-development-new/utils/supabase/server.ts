import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/database.types';
import { SupabaseClient } from '@supabase/supabase-js';

// Type alias for the createServerClient function to properly type it and avoid deprecation warnings
type CreateServerClientFn = (
  url: string, 
  key: string, 
  options: {
    cookies: {
      get(name: string): string | undefined;
      set(name: string, value: string, options: CookieOptions): void;
      remove(name: string, options: CookieOptions): void;
    };
    auth?: {
      persistSession: boolean;
      detectSessionInUrl?: boolean;
    };
  }
) => SupabaseClient<Database>;

/**
 * Create a Supabase client for server-side use in Server Components,
 * Server Actions, and Route Handlers.
 * The request parameter is kept for backward compatibility but is no longer used.
 */
export async function createClient(_request: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing required Supabase environment variables');
  }
  const cookieStore = await cookies();

  // Cast to our specific type to avoid deprecation warnings
  return (createServerClient as unknown as CreateServerClientFn)(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options, maxAge: 0 });
        }
      },
      auth: {
        persistSession: true,
        detectSessionInUrl: true,
      },
    }
  );
}

/**
 * Create a Supabase admin client with service role privileges.
 * This bypasses Row Level Security and should only be used for admin operations
 * where you need superuser access to the database.
 * 
 * WARNING: Never expose this client to client-side code or public APIs.
 */
export async function createAdminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    throw new Error('Missing required Supabase environment variables');
  }
  
  // Cast to our specific type to avoid deprecation warnings
  return (createServerClient as unknown as CreateServerClientFn)(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    {
      cookies: {
        get: (_name: string) => undefined,
        set: (_name: string, _value: string, _options: CookieOptions) => {},
        remove: (_name: string, _options: CookieOptions) => {},
      },
      auth: {
        persistSession: false,
      },
    }
  );
}
