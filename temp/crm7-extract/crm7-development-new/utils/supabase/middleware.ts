import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { logger } from '@/lib/logger';
import type { Database } from '@/lib/database.types';
import { SupabaseClient } from '@supabase/supabase-js';

// Type alias for the createServerClient function in middleware
type CreateMiddlewareClientFn = (
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
      flowType?: 'pkce';
    };
  }
) => SupabaseClient<Database>;

export function createClient(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Cookie settings shared across get/set operations
  const cookieSettings: Pick<CookieOptions, 'secure' | 'sameSite' | 'httpOnly' | 'path'> = {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    httpOnly: true,
    path: '/'
  };

  return {
    supabase: (createServerClient as unknown as CreateMiddlewareClientFn)(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value,
              ...options,
              ...cookieSettings
            });
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value: '',
              ...options,
              ...cookieSettings,
              maxAge: 0
            });
          },
        },
        auth: {
          persistSession: true,
          detectSessionInUrl: true,
          flowType: 'pkce'
        }
      }
    ),
    response,
  };
}

const PUBLIC_PATHS = [
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/callback',
  '/',
  '/auth', // Added the base auth path
];

export async function updateSession(request: NextRequest) {
  try {
    const { supabase, response } = createClient(request);
    const requestPath = request.nextUrl.pathname;

    // Check if the current path is public
    const isPublicPath = PUBLIC_PATHS.some((path) => requestPath.startsWith(path));

    // Always use getUser() to verify authentication
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      logger.error('Auth error in middleware', { error, path: requestPath });
      // Only redirect to login if not already on a public path
      return isPublicPath ? response : NextResponse.redirect(new URL('/auth/login', request.url));
    }

    if (!user && !isPublicPath) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Prevent authenticated users from accessing login/signup pages
    if (user && (requestPath.startsWith('/auth/login') || requestPath.startsWith('/auth/signup'))) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Set secure cookie options
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    };

    // Update session cookies if user is authenticated
    if (user) {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        response.cookies.set('sb-access-token', session.access_token, cookieOptions);
        response.cookies.set('sb-refresh-token', session.refresh_token, cookieOptions);
      }
    }

    return response;
  } catch (err) {
    logger.error('Unexpected error in middleware', { error: err });
    return NextResponse.redirect(new URL('/error', request.url));
  }
}
