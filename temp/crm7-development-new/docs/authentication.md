# Supabase Authentication Best Practices with Next.js 15.3

This document outlines the best practices for implementing Supabase authentication in our Next.js 15.3 application.

## Key Components

Our authentication implementation consists of several key components:

- Server-side Supabase client
- Authentication middleware
- Client-side auth provider
- Protected routes
- Row Level Security policies

## Server-Side Client

The server-side Supabase client handles cookie-based authentication for server components and actions.

**Location:** `/utils/supabase/server.ts`

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/database.types';

export function createClient() {
  // Create server client with proper cookie handling for SSR
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookies().get(name)?.value;
        },
        set(name, value, options) {
          cookies().set({ name, value, ...options });
        },
        remove(name, options) {
          cookies().set({ name, value: '', ...options });
        },
      },
      auth: {
        persistSession: true,
        detectSessionInUrl: true
      }
    }
  );
}
```

## Authentication Middleware

The middleware intercepts requests to handle authentication, session refreshing, and protected routes.

**Location:** `/middleware.ts`

```typescript
import { createClient } from '@supabase/ssr';

export async function middleware(request) {
  // Create a response object that we can modify
  const response = NextResponse.next({...});
  
  // Create a Supabase client specifically for the middleware
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return request.cookies.get(name)?.value },
        set(name, value, options) { 
          response.cookies.set({...})
        },
        remove(name, options) {
          response.cookies.set({...})
        }
      }
    }
  );
  
  // Check session and handle redirects for protected routes
  const { data: { session } } = await supabase.auth.getSession();
  
  // Implement redirect logic for authentication flows
}
```

## Client-Side Auth Provider

The AuthProvider manages client-side authentication state and provides methods for auth operations.

**Location:** `/components/auth/AuthProvider.tsx`

```typescript
'use client';

import { createClient } from '@/utils/supabase/client';

export function AuthProvider({ children }) {
  // State for user, session, loading
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  
  // Computed property for authentication status
  const isAuthenticated = !!session;
  
  // Auth methods (signIn, signUp, signOut, etc.)
  
  // Listen for auth state changes with onAuthStateChange
  
  // Provide auth context to components
}
```

## Protected Routes

Routes can be protected by using the `requireAuth` helper in Server Components.

**Location:** `/lib/auth/rbac.ts`

```typescript
import { createClient } from '@/utils/supabase/server';

export async function requireAuth() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect('/auth/login');
  }
  
  return user;
}

export async function requireRole(role) {
  const user = await requireAuth();
  // Check if user has required role
  // Redirect if not authorized
}
```

## Row Level Security (RLS)

RLS policies determine what data each user can access in the database.

**Location:** `/supabase/migrations/`

```sql
-- Enable RLS on tables
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own items" 
ON public.items FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can edit their own items" 
ON public.items FOR UPDATE 
USING (auth.uid() = user_id);
```

## Auth Flow

The complete authentication flow works as follows:

- User visits the application
- Middleware checks for an active session
- If no session exists and the route is protected, redirect to login
- User logs in via LoginForm component
- Supabase creates a session and sets cookies
- AuthProvider updates client state
- Middleware allows access to protected routes
- RLS policies automatically filter data based on the user's identity

## Best Practices

- **Cookie Security**: Always use `httpOnly`, `secure`, and `sameSite` options for auth cookies
- **Session Refreshing**: Implement proper token refresh in middleware
- **CSRF Protection**: Use PKCE flow for OAuth/auth links
- **Error Handling**: Implement comprehensive error handling for auth flows
- **Typed Clients**: Use database types with Supabase client for type safety
- **RLS Testing**: Always test RLS policies thoroughly
- **Auth Guards**: Use server-side authentication checks for critical routes
- **Client Data Access**: Client components should use role-based access control
- **Auth State**: Keep auth state synchronized between client and server

## Common Auth Operations

- **Login/Signup**: Use `signInWithPassword` and `signUp` methods
- **OAuth**: Use `signInWithOAuth` for social login
- **Logout**: Use `signOut` method and clear client state
- **Password Reset**: Implement password reset flow with email
- **Session Management**: Use `getSession` and refresh tokens

By following these practices, we maintain a secure, robust authentication system across our Next.js application.
