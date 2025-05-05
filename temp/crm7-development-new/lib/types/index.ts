export interface User {
  id: string;
  email?: string;
  org_id: string;
  // Add other user properties as needed
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

export * from './api';
export * from './database';
export * from './errors';
export * from './monitoring';
export * from './rates';

// Re-export specific types from supabase to avoid conflicts
export type { Database } from './supabase';

export type { SupabaseClient } from '@supabase/supabase-js';
