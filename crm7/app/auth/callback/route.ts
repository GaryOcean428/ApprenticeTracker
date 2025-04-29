import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (!code) {
      return NextResponse.redirect(new URL('/auth/error?reason=no-code', request.url));
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async get(name: string) {
            const cookie = await cookieStore.get(name);
            return cookie?.value;
          },
          async set(name: string, value: string, options: CookieOptions) {
            await cookieStore.set({
              name,
              value,
              ...options,
              path: options.path || '/',
            });
          },
          async remove(name: string, options: CookieOptions) {
            await cookieStore.set({
              name,
              value: '',
              ...options,
              maxAge: 0,
              path: options.path || '/',
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;

    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.redirect(new URL('/auth/error', request.url));
  }
}
