import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get('Authorization');
  const expectedToken = process.env['DEPLOYMENT_WEBHOOK_TOKEN'];

  if (!authHeader?.startsWith('Bearer ') || authHeader.split(' ')[1] !== expectedToken) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const monitoringUrl = process.env['MONITORING_WEBHOOK_URL'];
    if (monitoringUrl) {
      const monitoringResponse = await fetch(monitoringUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'deployment_started' }),
      });

      if (!monitoringResponse.ok) {
        throw new Error(`Monitoring request failed: ${monitoringResponse.statusText}`);
      }
    }

    // Process deployment
    // ... deployment logic here ...

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    const errorTrackingUrl = process.env['ERROR_TRACKING_URL'];
    if (errorTrackingUrl) {
      try {
        const errorTrackingResponse = await fetch(errorTrackingUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
        });

        if (!errorTrackingResponse.ok) {
          console.error(`Error tracking request failed: ${errorTrackingResponse.statusText}`);
        }
      } catch (networkError) {
        console.error('Network error while sending error tracking request:', networkError);
      }
    }

    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
