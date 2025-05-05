import { ratesService } from '@/lib/services/rates/service-instance';
import { RateTemplateStatus, type RateTemplate } from '@/lib/services/rates/types';
import { createApiHandler } from '@/lib/utils/api';
import { type ApiResponse } from '@/types/api';
import { NextResponse, type NextRequest } from 'next/server';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isRateTemplate(value: unknown): value is RateTemplate {
  if (!isRecord(value)) return false;

  const requiredFields = [
    'id',
    'orgId',
    'name',
    'templateType',
    'baseRate',
    'baseMargin',
    'superRate',
    'leaveLoading',
    'workersCompRate',
    'payrollTaxRate',
    'trainingCostRate',
    'otherCostsRate',
    'fundingOffset',
    'casualLoading',
    'effectiveFrom',
    'status',
    'createdAt',
    'updatedAt',
    'createdBy',
    'updatedBy',
    'version'
  ] as const;

  const hasAllFields = requiredFields.every(field => field in value);
  if (!hasAllFields) return false;

  return (
    typeof value.id === 'string' &&
    typeof value.orgId === 'string' &&
    typeof value.name === 'string' &&
    typeof value.templateType === 'string' &&
    ['hourly', 'daily', 'fixed'].includes(value.templateType) &&
    typeof value.baseRate === 'number' &&
    typeof value.baseMargin === 'number' &&
    typeof value.superRate === 'number' &&
    typeof value.leaveLoading === 'number' &&
    typeof value.workersCompRate === 'number' &&
    typeof value.payrollTaxRate === 'number' &&
    typeof value.trainingCostRate === 'number' &&
    typeof value.otherCostsRate === 'number' &&
    typeof value.fundingOffset === 'number' &&
    typeof value.casualLoading === 'number' &&
    typeof value.effectiveFrom === 'string' &&
    (value.effectiveTo === undefined || typeof value.effectiveTo === 'string') &&
    typeof value.status === 'string' &&
    Object.values(RateTemplateStatus).includes(value.status as RateTemplateStatus) &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string' &&
    typeof value.createdBy === 'string' &&
    typeof value.updatedBy === 'string' &&
    typeof value.version === 'number' &&
    (value.description === undefined || typeof value.description === 'string')
  );
}

export default createApiHandler(async function calculateHandler(
  req: NextRequest
): Promise<NextResponse<ApiResponse<number>>> {
  try {
    const body: unknown = await req.json();
    if (!isRateTemplate(body)) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_REQUEST',
            message: 'Invalid rate template data',
            status: 400,
          },
        },
        { status: 400 }
      );
    }

    const template: RateTemplate = body;
    const rate = await ratesService.calculateRate(template);
    return NextResponse.json({ data: rate });
  } catch (error) {
    console.error('Failed to calculate rate:', error);
    return NextResponse.json(
      {
        error: {
          code: 'CALCULATION_FAILED',
          message: 'Failed to calculate rate',
          status: 500,
        },
      },
      { status: 500 }
    );
  }
});
