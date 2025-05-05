import { NextRequest, NextResponse } from 'next/server';
import { captureError } from '@/lib/monitoring';

interface Session {
  user: {
    roles: string[];
  };
}

interface ErrorResponse {
  error: string;
}

type Handler<T> = (req: NextRequest, session: Session | null) => Promise<NextResponse<T>>;

export const withAuth = <T>(handler: Handler<T>): Handler<T | ErrorResponse> => {
  return async (req: NextRequest): Promise<NextResponse<T | ErrorResponse>> => {
    try {
      const session = await getSession(req);
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return handler(req, session);
    } catch (error) {
      captureError(error instanceof Error ? error : new Error(String(error)), {
        context: 'auth0-middleware',
      });
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  };
};

export function withRoles(handler: Handler<any>, allowedRoles: string[]): Handler<any> {
  return async (req: NextRequest): Promise<NextResponse<any>> => {
    try {
      const session = await getSession(req);
      const userRoles = session?.user?.roles || [];

      if (!allowedRoles.some((role) => userRoles.includes(role))) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      return await withAuth(handler)(req, session);
    } catch (error) {
      captureError(error instanceof Error ? error : new Error(String(error)), {
        context: 'auth0-roles-middleware',
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  };
}

async function getSession(req: NextRequest): Promise<Session | null> {
  // Implementation would go here
  return null;
}
