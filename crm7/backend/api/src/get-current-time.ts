import { NextResponse } from 'next/server';

export async function handler(): Promise<NextResponse> {
  try {
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to get current time',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
