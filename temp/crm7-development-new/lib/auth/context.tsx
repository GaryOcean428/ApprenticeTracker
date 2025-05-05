'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
  initialUser?: User | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children, initialUser }: AuthProviderProps): JSX.Element => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(initialUser ?? null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    async function checkAuth() {
      try {
        const {
          data: { user: currentUser },
          error,
        } = await supabase.auth.getUser();
        if (error || !currentUser) {
          logger.error('Error checking auth state', { error });
          setUser(null);
          setSession(null);
        } else {
          setUser(currentUser);
          const {
            data: { session: currentSession },
          } = await supabase.auth.getSession();
          setSession(currentSession);
        }
      } catch (err) {
        logger.error('Unexpected error checking auth', { error: err });
        setUser(null);
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    }

    void checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, _session) => {
      try {
        const {
          data: { user: currentUser },
          error,
        } = await supabase.auth.getUser();

        if (error || !currentUser) {
          setUser(null);
          setSession(null);
          if (event !== 'SIGNED_OUT') {
            logger.error('Auth state change error', { error, event });
          }
        } else {
          setUser(currentUser);
          setSession(_session);
        }

        if (event === 'SIGNED_OUT' && !pathname.startsWith('/auth/')) {
          router.push('/auth/login');
        }
      } catch (err) {
        logger.error('Error handling auth state change', { error: err, event });
        setUser(null);
        setSession(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase, pathname]);

  const value = {
    session,
    user,
    isLoading,
    signOut: async () => {
      try {
        await supabase.auth.signOut();
        router.push('/auth/login');
      } catch (error) {
        logger.error('Error signing out', { error });
        toast({
          title: 'Error signing out',
          description: 'Please try again later',
          variant: 'destructive',
        });
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthProvider;
