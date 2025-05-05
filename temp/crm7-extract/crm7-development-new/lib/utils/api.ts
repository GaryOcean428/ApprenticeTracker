import { type NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@/types/api';

export function createApiHandler<T>(
  handler: (req: NextRequest) => Promise<NextResponse<ApiResponse<T>>>
): (req: NextRequest) => Promise<NextResponse<ApiResponse<T>>> {
  return handler;
}
