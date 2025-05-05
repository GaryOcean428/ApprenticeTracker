import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { logger } from '@/lib/logger';

export function useAdminAccess(): { isAdmin: boolean } {
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkAdminStatus = async (): Promise<void> => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          logger.error('Failed to get user for admin check', { error });
          setIsAdmin(false);
          return;
        }

        if (!user) {
          setIsAdmin(false);
          return;
        }

        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (rolesError) {
          logger.error('Failed to get user roles', { error: rolesError });
          setIsAdmin(false);
          return;
        }

        setIsAdmin(userRoles?.role === 'admin');
      } catch (err) {
        logger.error('Unexpected error checking admin status', { error: err });
        setIsAdmin(false);
      }
    };

    void checkAdminStatus();
  }, [supabase]);

  return { isAdmin };
}
