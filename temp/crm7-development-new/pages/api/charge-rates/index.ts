import { ratesService } from '@/lib/services/rates';
import { type RateTemplate, type RateTemplateUpdate, type RatesService } from '@/lib/types/rates';
import { type ApiResponse } from '@/types/api';
import { type NextApiRequest, type NextApiResponse } from 'next';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function validateRequestBody(body: unknown): RateTemplateUpdate | null {
  if (!isRecord(body)) return null;

  // Validate required fields
  const hasValidId = 'id' in body && typeof body.id === 'string' && body.id.length > 0;
  const hasValidOrgId = 'orgId' in body && typeof body.orgId === 'string' && body.orgId.length > 0;

  if (!hasValidId || !hasValidOrgId) return null;

  // Extract and validate required fields
  const { id, orgId } = body as { id: string; orgId: string };
  if (typeof id !== 'string' || typeof orgId !== 'string') {
    return null;
  }

  // At this point TypeScript knows body has the minimum required fields
  return {
    id,
    orgId,
    ...body
  } as RateTemplateUpdate;
}

function isTemplateResponse(value: unknown): value is { data: RateTemplate[] } {
  return (
    isRecord(value) &&
    'data' in value &&
    Array.isArray(value.data) &&
    value.data.every((item): item is RateTemplate => isRecord(item) && 'id' in item)
  );
}

function isRateTemplate(value: unknown): value is RateTemplate {
  return isRecord(value) && 'id' in value && typeof value.id === 'string';
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<RateTemplate>>
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Method not allowed',
        status: 405
      }
    });
    return;
  }

  try {
    const template = validateRequestBody(req.body);
    if (!template) {
      res.status(400).json({
        error: {
          code: 'INVALID_REQUEST',
          message: 'Invalid request body',
          status: 400
        }
      });
      return;
    }

    // orgId is guaranteed to be a string by validateRequestBody
    const service = ratesService as unknown as RatesService;
    const result = await service.getTemplates({ org_id: template.orgId });
    if (!isTemplateResponse(result) || !result.data.length) {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Rate template not found',
          status: 404
        }
      });
      return;
    }

    const updateData: Partial<RateTemplate> = {
      ...template,
      effectiveFrom: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedTemplate = await service.updateRateTemplate(template.id, updateData);
    if (!isRateTemplate(updatedTemplate)) {
      throw new Error('Invalid response from updateRateTemplate');
    }

    res.status(200).json({ data: updatedTemplate });
  } catch (error) {
    console.error('Failed to update rate template:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update rate template',
        status: 500
      }
    });
  }
}
