import { NextRequest, NextResponse } from 'next/server';
import { FairWorkServiceImpl } from '@/lib/services/fairwork/fairwork-service';
import type { RateTemplate } from '@/lib/types/rates';
import { createApiHandler } from '@/lib/utils/api';

export default createApiHandler(async function calculateHandler(req: NextRequest): Promise<NextResponse> {
  try {
    const data = await req.json();
    const fairworkService = new FairWorkServiceImpl({
      apiKey: process.env.FAIRWORK_API_KEY!,
      apiUrl: process.env.FAIRWORK_API_URL!,
      environment: process.env.NODE_ENV,
      timeout: 5000,
    });

    const template: RateTemplate = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateType: 'hourly',
    };

    const result = await fairworkService.getActiveAwards();
    return NextResponse.json({ result, template });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
});
