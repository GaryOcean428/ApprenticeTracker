import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  return new NextResponse('Not Implemented', { status: 501 });
}
