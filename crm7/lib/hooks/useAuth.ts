import { useState, useEffect } from 'react';
import { type AuthUser, type Provider } from '@/types/auth';
import { createClient } from '@/lib/supabase/client';

interface UseAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  accessToken: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const supabase = createClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const login = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google' as Provider,
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setAccessToken(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          name: session.user.user_metadata?.name,
          image: session.user.user_metadata?.avatar_url,
          role: session.user.user_metadata?.role,
        });
        setAccessToken(session.access_token);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setAccessToken(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect((): void => {
    void refreshToken();
  }, []);

  return {
    isAuthenticated,
    isLoading,
    user,
    accessToken,
    login,
    logout,
    refreshToken,
  };
}
