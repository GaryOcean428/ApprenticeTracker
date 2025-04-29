import { NextRequest, NextResponse } from 'next/server';

export type ApiHandler<T = unknown> = (
  req: NextRequest
) => Promise<NextResponse<T>>;
