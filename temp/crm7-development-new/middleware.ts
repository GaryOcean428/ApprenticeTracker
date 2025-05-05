import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/middleware';
import { logger } from '@/lib/logger';

/**
 * Middleware that refreshes the user's session and handles authentication checks.
 * This implementation follows the Next.js 15 and Supabase SSR best practices.
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Get Supabase client for middleware
  const { supabase } = createClient(request);

  // Routes that don't require authentication
  const publicPaths = [
    '/auth/login',
    '/auth/signup',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/callback',
    '/auth/error',
    '/',
    '/api/', // API routes may have their own auth
    '/public/',
  ];

  const requestPath = request.nextUrl.pathname;
  const isPublicPath = publicPaths.some(path => {
    const execResult = new RegExp('^' + path.replace(/\//g, '\\/')).exec(requestPath);
    return Boolean(execResult);
  });

  // Static asset paths that should bypass auth checks
  if (
    requestPath.match(/\.(ico|png|jpg|jpeg|svg|css|js|json|woff|woff2|ttf|eot)$/i) ||
    requestPath.startsWith('/_next/') ||
    requestPath.startsWith('/fonts/')
  ) {
    return response;
  }

  try {
    // This will refresh the session automatically if needed
    const { data: { session } } = await supabase.auth.getSession();
  
    // Only redirect authenticated users if they're trying to access login/signup pages
    if (session && (requestPath.startsWith('/auth/login') || requestPath.startsWith('/auth/signup'))) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  
    // Redirect unauthenticated users trying to access protected routes
    if (!session && !isPublicPath) {
      // Store the original URL to redirect back after login
      const redirectUrl = new URL('/auth/login', request.url);
      redirectUrl.searchParams.set('redirect', encodeURIComponent(requestPath));
      logger.debug('Redirecting unauthenticated user', { from: requestPath, to: redirectUrl.pathname });
      return NextResponse.redirect(redirectUrl);
    }

    return response;
  } catch (error) {
    logger.error('Middleware auth error:', { error, path: requestPath });
    // For errors, redirect to error page but only for non-public paths
    return isPublicPath 
      ? response 
      : NextResponse.redirect(new URL('/auth/error', request.url));
  }
}

// Specify which routes to run the middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - API routes that handle their own auth
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
