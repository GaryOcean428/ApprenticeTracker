/* Test utility types and functions */

export class PostgrestErrorType extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PostgrestError';
  }
}

export function createMockQueryResult<T>(params: { data: T | undefined; isLoading: boolean; error: Error | null; }): T | undefined {
  // For testing, simply return the data
  return params.data;
}
