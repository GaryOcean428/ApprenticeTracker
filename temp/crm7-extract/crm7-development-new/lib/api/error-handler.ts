import { type NextRequest, NextResponse } from 'next/server';
import { createApiResponse } from './response';
import { logger } from '@/lib/logger';

interface ApiError {
  code: string;
  message: string;
  status: number;
  details?: Record<string, unknown>;
}

export function withErrorHandler<T>(
  handler: (req: NextRequest, context: unknown) => Promise<NextResponse<T>>
): (req: NextRequest, context: unknown) => Promise<NextResponse<ApiError | T>> {
  return async (req: NextRequest, context: unknown): Promise<NextResponse<ApiError | T>> => {
    try {
      return await handler(req, context);
    } catch (error) {
      logger.error('API Error:', { error });
      
      const errorResponse: ApiError = {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        status: 500,
        details: error instanceof Error ? { stack: error.stack } : undefined
      };

      return NextResponse.json(errorResponse, { status: errorResponse.status });
    }
  };
}
