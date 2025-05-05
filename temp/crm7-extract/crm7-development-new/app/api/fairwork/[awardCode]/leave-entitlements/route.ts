import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { createApiResponse } from '@/lib/api/response';
import { FairWorkClient } from '@/lib/services/fairwork/fairwork-client';

const leaveParamsSchema = z.object({
  awardCode: z.string(),
});

type RouteParams = z.infer<typeof leaveParamsSchema>;

type RouteContext = {
  params: Promise<RouteParams>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<Response> {
  try {
    const params = await context.params;
    const validatedParams = leaveParamsSchema.parse(params);
    
    const client = new FairWorkClient({
      apiKey: process.env.FAIRWORK_API_KEY!,
      apiUrl: process.env.FAIRWORK_API_URL!,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
      timeout: 5000,
    });

    const entitlements = await client.getLeaveEntitlements(validatedParams.awardCode, {
      employmentType: 'permanent',
      date: new Date().toISOString(),
    });
    return createApiResponse(entitlements);
  } catch (error) {
    return createApiResponse(undefined, {
      code: 'INVALID_REQUEST',
      message: error instanceof Error ? error.message : 'Invalid request',
    });
  }
}
