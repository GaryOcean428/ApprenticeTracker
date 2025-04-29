import { createApiResponse, createErrorResponse } from '@/lib/api/response';
import { logger } from '@/lib/logger';
import { getAllowances } from '@/lib/services/fairwork/allowances';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ awardCode: string; classificationCode: string }> }
) {
  try {
    const { awardCode, classificationCode } = await context.params;
    if (!awardCode || !classificationCode) {
      return createErrorResponse(
        'MISSING_PARAMS',
        'Missing required parameters: awardCode and classificationCode',
        undefined,
        400
      );
    }

    const allowances = await getAllowances(awardCode, classificationCode);
    return createApiResponse(allowances);
  } catch (error) {
    logger.error('Failed to fetch allowances', { error });
    return createErrorResponse(
      'ALLOWANCES_FETCH_ERROR',
      'Failed to fetch allowances',
      undefined,
      500
    );
  }
}
