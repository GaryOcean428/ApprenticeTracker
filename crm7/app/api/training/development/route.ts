import { logger } from '@/lib/logger';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

const DevelopmentContentSchema = z.object({
  // Add schema validation based on your Puck editor data structure
  content: z.any(),
  timestamp: z.string().datetime().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Invalid content type. Expected application/json' },
        { status: 415 }
      );
    }

    const data = await request.json();
    const validatedData = DevelopmentContentSchema.parse({
      content: data,
      timestamp: new Date().toISOString(),
    });

    // TODO: Save content to database
    logger.info('Saving development content', { data: validatedData });

    return NextResponse.json(validatedData);
  } catch (error) {
    logger.error('Failed to save development content', { error });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    // TODO: Fetch content from database
    const data = {
      content: {},
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(data);
  } catch (error) {
    logger.error('Failed to fetch development content', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
