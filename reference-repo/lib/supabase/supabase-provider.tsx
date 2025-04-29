'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { type SupabaseClient } from '@supabase/supabase-js';
import { createClient } from './config';
import { logger } from '@/lib/utils/logger';
import type { Database } from '@/types/supabase';

interface SupabaseContext {
  supabase: SupabaseClient<Database>;
}

const Context = createContext<SupabaseContext | undefined>(undefined);

export default function SupabaseProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [client] = useState(() => createClient());

  useEffect(() => {
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(async (_event) => {
      try {
        if (_event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED') {
          const {
            data: { user },
            error,
          } = await client.auth.getUser();

          if (error) {
            logger.error('Failed to verify user after auth state change', { error, _event });
            return;
          }

          if (!user) {
            logger.warn('No user found after auth state change', { _event });
            return;
          }

          logger.info('Auth state changed successfully', { _event, userId: user.id });
        }
      } catch (err) {
        logger.error('Unexpected error handling auth state change', { error: err, _event });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [client]);

  return <Context.Provider value={{ supabase: client }}>{children}</Context.Provider>;
}

export const useSupabase = (): SupabaseContext => {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error('useSupabase must be used inside SupabaseProvider');
  }
  return context;
};
