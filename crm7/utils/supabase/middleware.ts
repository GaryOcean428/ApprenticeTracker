import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { logger } from '@/lib/logger';

export function createClient(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  return {
    supabase: createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async get(name: string) {
            return request.cookies.get(name)?.value;
          },
          async set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          async remove(name: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value: '',
              ...options,
            });
          },
        },
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
