import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

type Handler<T> = (req: NextRequest) => Promise<NextResponse<T>>;

export function monitorAPIEndpoint<T extends Handler<unknown>>(
  originalMethod: T,
  endpointName: string
): T {
  return async function monitoredMethod(req: NextRequest): Promise<NextResponse<unknown>> {
    const startTime = Date.now();

    try {
      const result = await originalMethod(req);
      const duration = Date.now() - startTime;

      logger.info(`API endpoint ${endpointName} completed`, {
        duration,
        success: true,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error(`API endpoint ${endpointName} failed`, {
        duration,
        error,
      });

      throw error;
    }
  } as T;
}

export const withEndpoint = <T>(handler: Handler<T>): Handler<T> => {
  return async (req: NextRequest): Promise<NextResponse<T>> => {
    try {
      return await handler(req);
    } catch (error) {
      console.error('Endpoint error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 }) as NextResponse<T>;
    }
  };
};
