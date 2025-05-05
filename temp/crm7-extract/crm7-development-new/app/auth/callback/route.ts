import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

/**
 * This route handles auth callbacks from Supabase authentication:
 * - Email confirmation links
 * - OAuth provider redirects
 * - Password reset flows
 * 
 * It exchanges the code for a session and redirects the user to the appropriate page
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';
  
  // Handle cases where the code is not present
  if (!code) {
    logger.error('Missing auth code in callback URL');
    return NextResponse.redirect(new URL('/auth/error?message=Missing+authorization+code', request.url));
  }
  
  try {
    const supabase = await createClient(request);
    
    // Exchange the code for a session
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      logger.error('Auth exchange error', { error });
      throw error;
    }
    
    // Check if this is a new user (signup) or returning user (sign-in/reset)
    const isNewUser = data.user?.created_at === data.user?.updated_at;
    
    if (isNewUser) {
      // For new users, you might want to do additional setup or redirect to a welcome page
      logger.info('New user signed up', { userId: data.user?.id });
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
    
    // Check for specified redirect URL
    const redirectTo = decodeURIComponent(next);
    
    // Validate the redirect URL to prevent open redirects
    const allowedRedirects = ['/dashboard', '/account', '/onboarding', '/profile', '/'];
    const isValidRedirectUrl = allowedRedirects.some(path => redirectTo.startsWith(path));
    
    // Redirect to dashboard or validated redirect path
    const redirectUrl = new URL(isValidRedirectUrl ? redirectTo : '/dashboard', request.url);
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    logger.error('Error during auth callback', { error });
    
    let errorMessage = 'An unexpected authentication error occurred';
    let errorCode = 'unknown_error';
    
    if (error instanceof Error) {
      errorMessage = encodeURIComponent(error.message);
      errorCode = error.name || 'unknown_error';
    }
    
    return NextResponse.redirect(
      new URL(`/auth/error?message=${errorMessage}&code=${errorCode}`, request.url)
    );
  }
}
