import { Database } from '@/lib/database.types';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';
import type { RequestCookies } from 'next/dist/server/web/spec-extension/cookies';
import { cookies } from 'next/headers';

const getRequiredEnvVar = (name: string): string => {
  const value = process.env[name];
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

interface CookieStore {
  get: (name: string) => { value?: string } | undefined;
  set: (options: { name: string; value: string } & CookieOptions) => void;
  delete: (options: { name: string } & CookieOptions) => void;
}

const createCookieStore = (): CookieStore => {
  // Cast to RequestCookies since we know it's synchronous in Next.js app router
  const cookieStore = cookies() as unknown as RequestCookies;

  return {
    get: (name: string) => {
      const cookie = cookieStore.get(name);
      if (typeof cookie?.value !== 'string') {
        return undefined;
      }
      return { value: cookie.value };
    },
    set: (options: { name: string; value: string } & CookieOptions) => {
      const { name, value, ...cookieOptions } = options;
      cookieStore.set({
        name,
        value,
        ...cookieOptions,
      });
    },
    delete: (options: { name: string } & CookieOptions) => {
      cookieStore.delete(options.name);
    },
  };
};

export function createClient(): SupabaseClient<Database> {
  const cookieStore = createCookieStore();
  const url = getRequiredEnvVar('NEXT_PUBLIC_SUPABASE_URL');
  const anonKey = getRequiredEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      get(name: string): string | undefined {
        const cookie = cookieStore.get(name);
        return typeof cookie?.value === 'string' ? cookie.value : undefined;
      },
      set(name: string, value: string, options: CookieOptions): void {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions): void {
        cookieStore.delete({ name, ...options });
      },
    },
  });
}

export function createAdminClient(): SupabaseClient<Database> {
  const cookieStore = createCookieStore();
  const url = getRequiredEnvVar('NEXT_PUBLIC_SUPABASE_URL');
  const serviceKey = getRequiredEnvVar('SUPABASE_SERVICE_KEY');

  return createServerClient<Database>(url, serviceKey, {
    cookies: {
      get(name: string): string | undefined {
        const cookie = cookieStore.get(name);
        return typeof cookie?.value === 'string' ? cookie.value : undefined;
      },
      set(name: string, value: string, options: CookieOptions): void {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions): void {
        cookieStore.delete({ name, ...options });
      },
    },
  });
}
