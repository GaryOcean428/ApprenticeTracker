import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/types/api';

/**
 * Handles authentication errors and returns a JSON response conforming to ApiResponse<T>.
 * 
 * @param error - An object containing the error message and status code.
 */
export function handleAuthError<T>(error: { message: string; statusCode: number }): ReturnType<typeof NextResponse.json> {
  const response: ApiResponse<T> = {
    error: {
      code: 'AUTH_ERROR',
      message: error.message,
      status: error.statusCode,
    },
  };
  return NextResponse.json(response, { status: error.statusCode });
}

/**
 * Handles unexpected internal server errors and returns a JSON response conforming to ApiResponse<T>.
 * 
 * @param error - Optional error object to log additional details.
 */
export function handleInternalError<T>(error?: Error): ReturnType<typeof NextResponse.json> {
  if (typeof error !== "undefined" && error !== null) {
    console.error('Internal server error:', error);
  }
  const response: ApiResponse<T> = {
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
      status: 500,
    },
  };
  return NextResponse.json(response, { status: 500 });
}
