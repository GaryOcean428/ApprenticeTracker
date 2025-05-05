import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { ServiceRegistry } from '@/lib/services/service-registry';
import { ServiceFactory } from '@/lib/services/service-factory';
import type { FairWorkServiceImpl } from '@/lib/services/fairwork/fairwork-service';

export async function GET(_req: NextRequest): Promise<NextResponse> {
  const factory = ServiceFactory.getInstance();
  const serviceRegistry = ServiceRegistry.getInstance(factory);
  try {
    const fairworkService = serviceRegistry.getService<FairWorkServiceImpl>('fairworkService');
    const awards = await fairworkService.getActiveAwards();
    return NextResponse.json({
      awards,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to get active awards', { error });
    return NextResponse.json({ error: 'Failed to get active awards' }, { status: 500 });
  }
}
