import type { PostgrestError } from '@supabase/supabase-js';
import { Database } from './database.types';
import { SupabaseClient } from '@supabase/supabase-js';

export class PostgrestErrorType implements PostgrestError {
  message: string;
  details: string;
  hint: string;
  code: string;

  constructor(message: string) {
    this.message = message;
    this.details = '';
    this.hint = '';
    this.code = 'TEST_ERROR';
  }
}

export interface MockQueryResult<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

export function createMockQueryResult<T>(params: {
  data?: T;
  error?: Error | null;
  isLoading?: boolean;
}): MockQueryResult<T> {
  return {
    data: params.data ?? null,
    error: params.error ?? null,
    isLoading: params.isLoading ?? false
  };
}

export type MockSupabaseClient = jest.Mocked<SupabaseClient<Database>>;

export interface TestContext {
  supabase: MockSupabaseClient;
}

export interface TestUser {
  id: string;
  email: string;
  role: string;
  org_id: string;
  metadata?: Record<string, unknown>;
}

export interface TestOrganization {
  id: string;
  name: string;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface TestData {
  user?: TestUser;
  organization?: TestOrganization;
  [key: string]: unknown;
}
