import { useState, useEffect } from 'react';
import { type User } from '@/types/auth';
import { createClient } from '@/lib/supabase/client';

interface UseUserReturn {
  user: User | null;
  loading: boolean;
  error: Error | null;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export function useUser(): UseUserReturn {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect((): void => {
    const fetchUser = async (): Promise<void> => {
      try {
        const { data: { user: supabaseUser }, error: supabaseError } = await supabase.auth.getUser();

        if (typeof supabaseError !== "undefined" && supabaseError !== null) {
          throw supabaseError;
        }

        if (supabaseUser) {
          const userData: User = {
            id: supabaseUser.id,
            email: supabaseUser.email ?? '',
            name: supabaseUser.user_metadata?.name,
            role: supabaseUser.user_metadata?.role,
            createdAt: supabaseUser.created_at,
            updatedAt: supabaseUser.updated_at ?? '',
          };
          setUser(userData);
        } else {
          setUser(null);
        }
        setError(null);
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error('Failed to fetch user');
        setError(errorObj);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    void fetchUser();
  }, [supabase]);

  const refreshUser = async (): Promise<void> => {
    try {
      setError(null);
      await supabase.auth.refreshSession();
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Failed to refresh user');
      setError(errorObj);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Failed to logout');
      setError(errorObj);
    }
  };

  return {
    user,
    loading,
    error,
    refreshUser,
    logout,
  };
}
