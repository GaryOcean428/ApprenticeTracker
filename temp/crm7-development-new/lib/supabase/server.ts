import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const cookie = await cookieStore.get(name);
          return cookie?.value;
        },
        async set(name: string, value: string, options: CookieOptions) {
          try {
            await cookieStore.set({ name, value, ...options, path: '/' });
          } catch (error) {
            console.error('Error setting cookie:', error);
          }
        },
        async remove(name: string, options: CookieOptions) {
          try {
            await cookieStore.set({ name, value: '', ...options, path: '/', maxAge: 0 });
          } catch (error) {
            console.error('Error removing cookie:', error);
          }
        },
      },
    }
  );
}

export async function createAdminClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    {
      cookies: {
        async get(name: string) {
          const cookie = await cookieStore.get(name);
          return cookie?.value;
        },
        async set(name: string, value: string, options: CookieOptions) {
          try {
            await cookieStore.set({ name, value, ...options, path: '/' });
          } catch (error) {
            console.error('Error setting cookie:', error);
          }
        },
        async remove(name: string, options: CookieOptions) {
          try {
            await cookieStore.set({ name, value: '', ...options, path: '/', maxAge: 0 });
          } catch (error) {
            console.error('Error removing cookie:', error);
          }
        },
      },
    }
  );
}
