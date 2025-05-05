/**
 * Types for extended capabilities of the rates service
 * This supplements the existing types.ts file with additional types
 * for our enhanced functionality
 */
import type { RateTemplate } from './types';
import type { AwardRateValidationResult, AwardRateSuggestion } from './award-integration';
import type { MonitoringSpan } from './monitoring';

/**
 * Organization settings for rates
 */
export interface RateOrgSettings {
  defaultMargin: number;
  defaultSuperRate: number;
  defaultLeaveLoading: number;
  defaultWorkersCompRate: number;
  defaultPayrollTaxRate: number;
  defaultTrainingCostRate: number;
  defaultOtherCostsRate: number;
  defaultCasualLoading: number;
  autoApplyRounding: boolean;
  roundingMethod: 'up' | 'down' | 'nearest';
  roundingPrecision: number;
  enforceMinimumRates: boolean;
}

/**
 * Template comparison result
 */
export interface RateTemplateComparisonResult {
  baseTemplateId: string;
  compareTemplateId: string;
  differencePercent: number;
  differences: {
    field: string;
    baseValue: any;
    compareValue: any;
    differenceAmount?: number;
    differencePercent?: number;
  }[];
  summary: {
    totalDifference: number;
    significantChanges: string[];
  };
}

/**
 * Extended validation result with award compliance
 */
export interface ExtendedValidationResult extends AwardRateValidationResult {
  validationTime: string;
  complianceStatus: 'compliant' | 'non-compliant' | 'warning';
  additionalChecks: {
    name: string;
    passed: boolean;
    message?: string;
  }[];
}

/**
 * Enhanced rate analytics with additional metrics
 */
export interface EnhancedRateAnalytics {
  // Basic metrics from RateAnalytics
  totalTemplates: number;
  activeTemplates: number;
  averageRate: number;
  recentChanges: Array<{
    action: string;
    timestamp: string;
  }>;
  
  // Enhanced metrics
  topTemplatesByUse: Array<{
    id: string;
    name: string;
    usageCount: number;
  }>;
  rateDistribution: {
    min: number;
    max: number;
    median: number;
    p90: number;  // 90th percentile
    histogram: Array<{
      range: string;
      count: number;
    }>;
  };
  complianceMetrics: {
    compliantTemplatesCount: number;
    nonCompliantTemplatesCount: number;
    compliancePercentage: number;
  };
  templatesByStatus: {
    draft: number;
    active: number;
    archived: number;
    deleted: number;
  };
  changeFrequency: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

/**
 * Extended rate service interface with new capabilities
 */
export interface EnhancedRateService {
  // Template comparison
  compareTemplates(
    baseTemplateId: string,
    compareTemplateId: string
  ): Promise<RateTemplateComparisonResult>;
  
  // Award compliance checking
  validateTemplateCompliance(
    templateId: string
  ): Promise<ExtendedValidationResult>;
  
  // Rate suggestions
  getSuggestedRates(criteria: {
    industry?: string;
    role?: string;
    experience?: string;
  }): Promise<AwardRateSuggestion[]>;
  
  // Enhanced analytics
  getEnhancedAnalytics(params: { 
    orgId: string,
    startDate?: string,
    endDate?: string
  }): Promise<EnhancedRateAnalytics>;
  
  // Performance monitoring
  getServiceHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unavailable';
    responseTime: number;
    uptime: number;
    metrics: Record<string, number>;
    recentSpans: MonitoringSpan[];
  }>;
  
  // Template versioning
  restoreVersion(
    templateId: string,
    version: number
  ): Promise<RateTemplate>;
  
  // Bulk operations with progress tracking
  bulkValidate(
    templateIds: string[]
  ): Promise<{
    operationId: string;
    status: 'pending';
    progress: {
      total: number;
      completed: 0;
      inProgress: number;
      failed: 0;
      succeededIds: string[];
      failedIds: string[];
    };
  }>;
  
  getBulkOperationStatus(
    operationId: string
  ): Promise<{
    operationId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: {
      total: number;
      completed: number;
      inProgress: number;
      failed: number;
      succeededIds: string[];
      failedIds: string[];
    };
  }>;
}
