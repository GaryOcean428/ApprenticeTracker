import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { type Database } from '@/types/supabase';
import { type AuthUser } from '@/types/auth';

interface AuthSession {
  user: AuthUser;
}

export async function getSession(req: NextRequest): Promise<AuthSession | null> {
  const token = req.headers.get('Authorization')?.split(' ')[1];
  if (!token) {
    return null;
  }

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user?.email) {
      return null;
    }
    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role as string | undefined
      }
    };
  } catch {
    return null;
  }
}

export async function withAuth<T>(
  handler: (req: NextRequest, session: AuthSession) => Promise<NextResponse<T>>
): Promise<(req: NextRequest) => Promise<NextResponse<T>>> {
  return async (req: NextRequest): Promise<NextResponse<T>> => {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) as NextResponse<T>;
    }
    return handler(req, session);
  };
}

export async function getUser(req: NextRequest): Promise<AuthUser | null> {
  const session = await getSession(req);
  return session?.user ?? null;
}

export type { AuthUser, AuthSession };
