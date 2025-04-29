import { NextResponse } from 'next/server';

interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

export function createApiResponse<T>(
  data?: T,
  error?: ApiError,
  status = 200
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {};
  
  if (data !== undefined) {
    response.data = data;
  }
  
  if (typeof error !== "undefined" && error !== null) {
    response.error = error;
  }

  return NextResponse.json(response, { status });
}

export function createErrorResponse(
  code: string,
  message: string,
  details?: unknown,
  status = 400
): NextResponse {
  return createApiResponse(undefined, { code, message, details }, status);
}

export function createSuccessResponse<T>(
  data: T,
  status = 200
): NextResponse<ApiResponse<T>> {
  return createApiResponse(data, undefined, status);
}
