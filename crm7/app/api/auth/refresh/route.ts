import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import { logger } from '@/lib/logger';

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the user with server-side validation
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      logger.error('Failed to get user during refresh', { error: userError });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ error: 'No authenticated user' }, { status: 401 });
    }

    // Get a fresh session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      logger.error('Failed to get session during refresh', { error: sessionError });
      return NextResponse.json({ error: 'Failed to refresh session' }, { status: 500 });
    }

    return NextResponse.json({
      user,
      session,
    });
  } catch (error) {
    logger.error('Unexpected error during auth refresh', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
