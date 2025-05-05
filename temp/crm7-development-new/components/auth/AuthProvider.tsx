'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  refreshSession: () => Promise<void>;
  signInWithProvider: (provider: 'google' | 'github' | 'facebook') => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  
  // Create a Supabase client for browser
  const supabase = createClient();

  // Fetch session and set up auth state
  const fetchSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
        
      if (error) {
        console.error('Error getting session:', error);
        return null;
      }
        
      return session;
    } catch (error) {
      console.error('Error in auth provider:', error);
      return null;
    }
  }, [supabase]);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      
      try {
        const session = await fetchSession();
        
        setSession(session);
        setUser(session?.user || null);
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();
  }, [fetchSession]);
  
  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Handle auth events
        if (event === 'SIGNED_IN') {
          // Refresh data after sign in
          router.refresh();
          
          // If on auth page, redirect to dashboard
          if (pathname?.startsWith('/auth')) {
            router.push('/dashboard');
          }
        } else if (event === 'SIGNED_OUT') {
          // Refresh after sign out to clear server data
          router.refresh();
          
          // Redirect to login after sign out
          router.push('/auth/login');
        } else if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          // Just refresh page data on token refresh
          router.refresh();
        }
      }
    );
    
    // Cleanup on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase, pathname]);
  
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      return { error };
    } finally {
      setIsLoading(false);
    }
  };
  
  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      return { error };
    } finally {
      setIsLoading(false);
    }
  };
  
  const signInWithProvider = async (provider: 'google' | 'github' | 'facebook') => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      return { error };
    } finally {
      setIsLoading(false);
    }
  };
  
  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } finally {
      setIsLoading(false);
    }
  };
  
  const refreshSession = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.refreshSession();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setSession(session);
        setUser(session.user);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Use memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    session,
    isLoading,
    isAuthenticated: !!session,
    signIn,
    signUp,
    signOut,
    refreshSession,
    signInWithProvider
  }), [user, session, isLoading]);
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
