import type { PostgrestError } from '@supabase/supabase-js';

export class PostgrestErrorType extends Error implements PostgrestError {
  message: string;
  details: string;
  hint: string;
  code: string;

  constructor(message: string) {
    super(message);
    this.name = 'PostgrestError';
    this.message = message;
    this.details = '';
    this.hint = '';
    this.code = 'ERROR';
  }
}

export function createMockQueryResult<T>({
  data,
  error,
  isLoading,
}: {
  data: T | undefined;
  error: Error | null;
  isLoading: boolean;
}) {
  return {
    data,
    error,
    isLoading,
    isSuccess: !error && !isLoading,
    status: error ? 'error' : isLoading ? 'loading' : 'success',
  };
}
