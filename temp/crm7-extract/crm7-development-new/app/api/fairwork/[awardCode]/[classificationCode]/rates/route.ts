import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { createApiResponse } from '@/lib/api/response';
import { FairWorkClient } from '@/lib/services/fairwork/fairwork-client';

const rateParamsSchema = z.object({
  awardCode: z.string(),
  classificationCode: z.string(),
});

type RouteParams = z.infer<typeof rateParamsSchema>;

type RouteContext = {
  params: Promise<RouteParams>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<Response> {
  try {
    const params = await context.params;
    const validatedParams = rateParamsSchema.parse(params);
    
    const client = new FairWorkClient({
      apiKey: process.env.FAIRWORK_API_KEY!,
      apiUrl: process.env.FAIRWORK_API_URL!,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
      timeout: 5000,
    });

    const award = await client.getAward(validatedParams.awardCode);
    return createApiResponse(award);
  } catch (error) {
    return createApiResponse(undefined, {
      code: 'INVALID_REQUEST',
      message: error instanceof Error ? error.message : 'Invalid request',
    });
  }
}
