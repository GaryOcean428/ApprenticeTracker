import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import type { ApiResponse } from '@/lib/types/api';
import { logger } from '@/lib/utils/logger';
import { getSession } from '@/lib/auth';

const log = logger.info;
const prisma = new PrismaClient();

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

export interface AuthenticatedRequest extends NextRequest {
  user: AuthUser;
}

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 401,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export async function withAuth<T>(
  req: NextRequest,
  context: { params: Record<string, string> },
  handler: (
    req: AuthenticatedRequest,
    context: { params: Record<string, string> },
  ) => Promise<NextResponse<ApiResponse<T>>>,
): Promise<NextResponse<ApiResponse<T>>> {
  try {
    const session = await getSession(req);

    if (!session?.user?.email) {
      throw new AuthError('Unauthorized access attempt', 401, {
        path: req.nextUrl.pathname,
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      throw new AuthError('User not found', 401, {
        email: session.user.email,
      });
    }

    // Type assertion is safe here because we've validated the user object
    const authenticatedReq = req as AuthenticatedRequest;
    authenticatedReq.user = user;

    return handler(authenticatedReq, context);
  } catch (error) {
    if (error instanceof AuthError) {
      log('Auth error', error.context);
      return NextResponse.json({
        error: {
          code: 'AUTH_ERROR',
          message: error.message,
          status: error.statusCode,
        },
      } as ApiResponse<T>, {
        status: error.statusCode,
      });
    }

    log('Internal server error', { error });
    return NextResponse.json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
        status: 500,
      },
    } as ApiResponse<T>, { status: 500 });
  }
}
