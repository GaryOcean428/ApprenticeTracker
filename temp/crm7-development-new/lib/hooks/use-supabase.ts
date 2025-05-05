import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { type Database } from '@/types/supabase';

interface SupabaseContext {
  supabase: SupabaseClient<Database>;
  isInitialized: boolean;
}

const config = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
};

export function useSupabase(): SupabaseContext {
  const [context, setContext] = useState<SupabaseContext>(() => ({
    supabase: createClient<Database>(config.url, config.key),
    isInitialized: false,
  }));

  useEffect((): void => {
    if (!config.url || !config.key) {
      console.error('Supabase configuration is missing');
      return;
    }

    const supabase = createClient<Database>(config.url, config.key);
    setContext({ supabase, isInitialized: true });
  }, []);

  return context;
}
