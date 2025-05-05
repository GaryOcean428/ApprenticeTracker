/**
 * Enhanced Rates API
 * 
 * Provides API routes for the enhanced rates service with
 * additional features like template comparison, award validation,
 * and advanced analytics.
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

import { createConfiguredRateService } from '@/lib/services/rates/config';
import { FairWorkService } from '@/lib/services/fairwork/fairwork-service';
import { createClient as createFairWorkClient } from '@/lib/services/fairwork/fairwork-client';
import { RateError, RateErrorCode } from '@/lib/services/rates/errors';
import type { EnhancedRateService } from '@/lib/services/rates/enhanced-types';
import type { RateServiceConfiguration } from '@/lib/services/rates/config';
import { env } from '@/lib/config/environment';

// Mock authentication for demo purposes
// In a real application, use proper NextAuth or other auth mechanism
function getMockSession(): { user: { id: string; email: string } } | null {
  // This is just a placeholder implementation
  return {
    user: {
      id: 'user-1',
      email: 'demo@example.com'
    }
  };
}

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Initialize FairWork client and service
const fairWorkClient = createFairWorkClient({
  apiKey: env.FAIRWORK_API_KEY,
  apiUrl: env.FAIRWORK_API_URL,
  environment: env.NODE_ENV === 'production' ? 'production' : 'sandbox',
  timeout: 5000,
});

const fairWorkService = new FairWorkService(fairWorkClient, { 
  enableMetrics: true
});

// Service configuration
const getServiceConfig = (userId: string, orgId: string): RateServiceConfiguration => ({
  useEnhancedService: true,
  enableAwardValidation: true,
  userId,
  orgId,
  enableMonitoring: true,
  enableMetrics: true,
  enableActivityTracking: process.env.NODE_ENV === 'production'
});

/**
 * GET handler for fetching enhanced analytics
 */
export async function GET(request: Request): Promise<NextResponse> {
  try {
    // Authenticate user
    const session = getMockSession();
    if (session?.user == null) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Validate required parameters
    if (orgId == null) {
      return NextResponse.json(
        { error: 'Missing required parameter: orgId' },
        { status: 400 }
      );
    }
    
    // Create service with enhanced capabilities
    const rateService = createConfiguredRateService(
      fairWorkService,
      getServiceConfig(session.user.id, orgId)
    ) as EnhancedRateService;
    
    // Get enhanced analytics
    const analytics = await rateService.getEnhancedAnalytics({
      orgId,
      startDate: startDate ?? undefined,
      endDate: endDate ?? undefined
    });
    
    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error in enhanced rates API:', error);
    
    if (error instanceof RateError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.httpStatus }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Type for operation parameters
type OperationParams = {
  baseTemplateId?: string;
  compareTemplateId?: string;
  templateId?: string;
  templateIds?: string[];
  version?: number;
  industry?: string;
  role?: string;
  experience?: string;
};

/**
 * Process operation with proper type checking
 */
function processOperation(
  operation: string, 
  rateService: EnhancedRateService, 
  params: OperationParams
): Promise<unknown> {
  // Validate template comparison
  if (operation === 'compareTemplates') {
    if (
      typeof params.baseTemplateId !== 'string' ||
      typeof params.compareTemplateId !== 'string'
    ) {
      throw new RateError(
        'Invalid parameters',
        { code: RateErrorCode.VALIDATION_FAILED, httpStatus: 400 }
      );
    }
    return rateService.compareTemplates(params.baseTemplateId, params.compareTemplateId);
  }
  
  // Validate compliance
  if (operation === 'validateCompliance') {
    if (typeof params.templateId !== 'string') {
      throw new RateError(
        'Invalid templateId',
        { code: RateErrorCode.VALIDATION_FAILED, httpStatus: 400 }
      );
    }
    return rateService.validateTemplateCompliance(params.templateId);
  }
  
  // Get suggested rates
  if (operation === 'getSuggestedRates') {
    return rateService.getSuggestedRates({
      industry: typeof params.industry === 'string' ? params.industry : undefined,
      role: typeof params.role === 'string' ? params.role : undefined,
      experience: typeof params.experience === 'string' ? params.experience : undefined
    });
  }
  
  // Bulk validate templates
  if (operation === 'bulkValidate') {
    if (!Array.isArray(params.templateIds)) {
      throw new RateError(
        'Invalid templateIds',
        { code: RateErrorCode.VALIDATION_FAILED, httpStatus: 400 }
      );
    }
      
    // Filter to ensure all IDs are strings
    const templateIds = params.templateIds
      .filter((id): id is string => typeof id === 'string');
      
    if (templateIds.length === 0) {
      throw new RateError(
        'Empty templateIds array',
        { code: RateErrorCode.VALIDATION_FAILED, httpStatus: 400 }
      );
    }
      
    return rateService.bulkValidate(templateIds);
  }
  
  // Restore template version
  if (operation === 'restoreVersion') {
    if (
      typeof params.templateId !== 'string' ||
      typeof params.version !== 'number'
    ) {
      throw new RateError(
        'Invalid parameters',
        { code: RateErrorCode.VALIDATION_FAILED, httpStatus: 400 }
      );
    }
      
    return rateService.restoreVersion(params.templateId, params.version);
  }
  
  throw new RateError(
    'Unsupported operation',
    { code: RateErrorCode.UNKNOWN, httpStatus: 400 }
  );
}

// Request body schema
const requestSchema = z.object({
  operation: z.enum([
    'compareTemplates',
    'validateCompliance',
    'getSuggestedRates',
    'bulkValidate',
    'restoreVersion'
  ]),
  orgId: z.string(),
  params: z.object({
    baseTemplateId: z.string().optional(),
    compareTemplateId: z.string().optional(),
    templateId: z.string().optional(),
    templateIds: z.array(z.string()).optional(),
    version: z.number().optional(),
    industry: z.string().optional(),
    role: z.string().optional(),
    experience: z.string().optional()
  })
});

/**
 * POST handler for various enhanced rate operations
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    // Authenticate user
    const session = getMockSession();
    if (session?.user == null) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse and validate request body
    const rawBody: unknown = await request.json();
    const validationResult = requestSchema.safeParse(rawBody);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const { operation, orgId, params } = validationResult.data;
    
    // Create rate service
    const rateService = createConfiguredRateService(
      fairWorkService,
      getServiceConfig(session.user.id, orgId)
    ) as EnhancedRateService;
    
    try {
      // Process the request
      const result = await processOperation(operation, rateService, params);
      return NextResponse.json(result);
    } catch (error) {
      if (error instanceof RateError) {
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: error.httpStatus }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in enhanced rates API:', error);
    
    if (error instanceof RateError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.httpStatus }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
