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
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (typeof authError !== "undefined" && authError !== null) throw authError;

        if (typeof authUser !== "undefined" && authUser !== null) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single();

          if (typeof userError !== "undefined" && userError !== null) throw userError;

          setUser(userData);
        } else {
          setUser(null);
        }
        setError(null);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch user');
        setError(error);
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
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to refresh user');
      setError(error);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to logout');
      setError(error);
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
