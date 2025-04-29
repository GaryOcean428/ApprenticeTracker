import { captureError } from '@/lib/monitoring';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiError';

    // Capture error details for monitoring
    captureError(this, {
      statusCode,
      details,
    });
  }
}
