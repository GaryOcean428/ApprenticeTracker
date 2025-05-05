/**
 * Enhanced Rate Service Implementation
 * Extends the core RateService with additional advanced features
 */
import { logger } from '@/lib/utils/logger';
import type { FairWorkService } from '@/lib/services/fairwork/index';
import { RateServiceImpl, type RateServiceOptions } from './index';
import type { RateTemplate, RateAnalytics } from './types';
import { RateError, RateErrorCode } from './errors';
import { AwardRateValidator, type AwardRateSuggestion } from './award-integration';
import type {
  EnhancedRateService,
  RateTemplateComparisonResult,
  ExtendedValidationResult,
  EnhancedRateAnalytics,
} from './enhanced-types';
import { RateServiceMonitoring, SpanStatus } from './monitoring';

/**
 * Enhanced options for the extended rate service
 */
export interface EnhancedRateServiceOptions extends RateServiceOptions {
  /** Enable award compliance validation */
  enableAwardValidation?: boolean;
}

/**
 * Implementation of the enhanced rate service with additional advanced features
 */
export class EnhancedRateServiceImpl extends RateServiceImpl implements EnhancedRateService {
  private readonly awardValidator?: AwardRateValidator;
  private readonly monitoring?: RateServiceMonitoring;
  private readonly bulkOperations: Map<string, {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: {
      total: number;
      completed: number;
      inProgress: number;
      failed: number;
      succeededIds: string[];
      failedIds: string[];
    };
  }> = new Map();

  constructor(fairWorkService: FairWorkService, options: EnhancedRateServiceOptions = {}) {
    super(fairWorkService, options);
    
    // Initialize additional services
    if (options.enableAwardValidation) {
      this.awardValidator = new AwardRateValidator(fairWorkService);
    }
    
    if (options.enableMonitoring && options.metricsCollector) {
      this.monitoring = new RateServiceMonitoring(options.metricsCollector);
    }
  }

  /**
   * Compare two templates and identify differences
   */
  async compareTemplates(
    baseTemplateId: string,
    compareTemplateId: string
  ): Promise<RateTemplateComparisonResult> {
    try {
      // Start monitoring span if enabled
      const spanOperation = this.monitoring?.startSpan('compareTemplates', 'rate_analysis', {
        baseTemplateId,
        compareTemplateId
      });

      // Fetch both templates
      const baseTemplate = await this.getRateTemplate(baseTemplateId);
      const compareTemplate = await this.getRateTemplate(compareTemplateId);

      // Calculate differences
      const differences = [];
      let totalDifference = 0;
      const significantChanges = [];

      // Compare each field and calculate differences
      const compareFields = [
        'baseRate', 'baseMargin', 'superRate', 'leaveLoading', 
        'workersCompRate', 'payrollTaxRate', 'trainingCostRate', 
        'otherCostsRate', 'fundingOffset', 'casualLoading'
      ];

      for (const field of compareFields) {
        const baseValue = baseTemplate[field];
        const compareValue = compareTemplate[field];
        
        if (baseValue !== compareValue) {
          const absoluteDifference = compareValue - baseValue;
          const percentDifference = baseValue !== 0 
            ? (absoluteDifference / baseValue) * 100 
            : 0;
            
          differences.push({
            field,
            baseValue,
            compareValue,
            differenceAmount: absoluteDifference,
            differencePercent: percentDifference
          });
          
          totalDifference += Math.abs(percentDifference);
          
          // Track significant changes (more than 5%)
          if (Math.abs(percentDifference) > 5) {
            significantChanges.push(field);
          }
        }
      }

      // Create comparison result
      const result: RateTemplateComparisonResult = {
        baseTemplateId,
        compareTemplateId,
        differencePercent: (totalDifference / compareFields.length),
        differences,
        summary: {
          totalDifference,
          significantChanges
        }
      };

      // Finish monitoring span
      if (spanOperation) {
        this.monitoring?.finishSpan(spanOperation, SpanStatus.Ok, {
          differenceCount: differences.length,
          significantChangesCount: significantChanges.length
        });
      }

      return result;
    } catch (error) {
      // Finish monitoring span with error if started
      if (this.monitoring) {
        const errorSpan = this.monitoring.startSpan(
          'compareTemplates_error', 
          'rate_analysis_error',
          { baseTemplateId, compareTemplateId, error }
        );
        this.monitoring.finishSpan(errorSpan, SpanStatus.Error);
      }
      
      logger.error('Failed to compare templates', {
        error,
        baseTemplateId,
        compareTemplateId
      });
      
      throw error instanceof RateError
        ? error
        : new RateError('Failed to compare templates', {
          code: RateErrorCode.UNKNOWN,
          cause: error,
          context: { baseTemplateId, compareTemplateId }
        });
    }
  }

  /**
   * Validate a template against award compliance rules
   */
  async validateTemplateCompliance(
    templateId: string
  ): Promise<ExtendedValidationResult> {
    if (!this.awardValidator) {
      throw new RateError('Award validation not enabled', {
        code: RateErrorCode.FAIRWORK_SERVICE_ERROR
      });
    }

    try {
      const template = await this.getRateTemplate(templateId);
      const validationStart = Date.now();
      
      // Perform award validation
      const awardValidation = await this.awardValidator.validateRateAgainstAward(template);
      
      // Perform additional checks
      const additionalChecks = [
        {
          name: 'base_rate_check',
          passed: template.baseRate > 0,
          message: template.baseRate <= 0 ? 'Base rate must be greater than zero' : undefined
        },
        {
          name: 'dates_check',
          passed: !!template.effectiveFrom,
          message: !template.effectiveFrom ? 'Effective from date must be set' : undefined
        },
        {
          name: 'casual_loading_check',
          passed: template.casualLoading >= 25,
          message: template.casualLoading < 25 ? 'Casual loading appears to be below minimum requirements' : undefined
        }
      ];
      
      // Determine overall compliance status
      let complianceStatus: 'compliant' | 'non-compliant' | 'warning' = 'compliant';
      
      if (!awardValidation.isValid) {
        complianceStatus = 'non-compliant';
      } else if (additionalChecks.some(check => !check.passed)) {
        complianceStatus = 'warning';
      }
      
      return {
        ...awardValidation,
        validationTime: new Date().toISOString(),
        complianceStatus,
        additionalChecks
      };
    } catch (error) {
      logger.error('Failed to validate template compliance', { error, templateId });
      throw error instanceof RateError
        ? error
        : new RateError('Failed to validate template compliance', {
          code: RateErrorCode.TEMPLATE_INVALID,
          cause: error,
          context: { templateId }
        });
    }
  }

  /**
   * Get suggested rates based on criteria
   */
  async getSuggestedRates(criteria: {
    industry?: string;
    role?: string;
    experience?: string;
  }): Promise<AwardRateSuggestion[]> {
    if (!this.awardValidator) {
      throw new RateError('Award validation not enabled', {
        code: RateErrorCode.FAIRWORK_SERVICE_ERROR
      });
    }
    
    try {
      return await this.awardValidator.getSuggestedRates(criteria);
    } catch (error) {
      logger.error('Failed to get suggested rates', { error, criteria });
      throw error instanceof RateError
        ? error
        : new RateError('Failed to get suggested rates', {
          code: RateErrorCode.FAIRWORK_SERVICE_ERROR,
          cause: error,
          context: criteria
        });
    }
  }

  /**
   * Get enhanced analytics with additional metrics
   */
  async getEnhancedAnalytics(params: { 
    orgId: string,
    startDate?: string,
    endDate?: string
  }): Promise<EnhancedRateAnalytics> {
    try {
      // Get basic analytics first
      const baseAnalytics = await this.getAnalytics({ orgId: params.orgId });
      
      // Use internal data to enhance with additional metrics
      const templates = await this.getTemplates({ org_id: params.orgId });
      
      // Determine rate distribution
      const rates = templates.data.map(template => template.baseRate).sort((a, b) => a - b);
      const min = rates.length > 0 ? rates[0] : 0;
      const max = rates.length > 0 ? rates[rates.length - 1] : 0;
      const median = rates.length > 0 ? rates[Math.floor(rates.length / 2)] : 0;
      const p90 = rates.length > 0 ? rates[Math.floor(rates.length * 0.9)] : 0;
      
      // Build histogram
      const histogram = [];
      if (min !== max && rates.length > 0) {
        const bucketSize = (max - min) / 5; // Split into 5 buckets
        for (let i = 0; i < 5; i++) {
          const rangeStart = min + (i * bucketSize);
          const rangeEnd = min + ((i + 1) * bucketSize);
          const count = rates.filter(rate => rate >= rangeStart && rate < rangeEnd).length;
          histogram.push({
            range: `${rangeStart.toFixed(2)}-${rangeEnd.toFixed(2)}`,
            count
          });
        }
      }
      
      // Count templates by status
      const templatesByStatus = {
        draft: templates.data.filter(t => t.status === 'draft').length,
        active: templates.data.filter(t => t.status === 'active').length,
        archived: templates.data.filter(t => t.status === 'archived').length,
        deleted: templates.data.filter(t => t.status === 'deleted').length
      };
      
      // Our enhanced analytics object
      const enhancedAnalytics: EnhancedRateAnalytics = {
        // Include base analytics
        ...baseAnalytics,
        
        // Additional enhanced metrics
        topTemplatesByUse: templates.data.slice(0, 5).map(t => ({
          id: t.id,
          name: t.name,
          usageCount: Math.floor(Math.random() * 50) // Mock data - would come from calculations table in real impl
        })),
        rateDistribution: {
          min,
          max,
          median,
          p90,
          histogram
        },
        complianceMetrics: {
          compliantTemplatesCount: Math.floor(templates.data.length * 0.85), // Mock data
          nonCompliantTemplatesCount: Math.ceil(templates.data.length * 0.15), // Mock data
          compliancePercentage: 85 // Mock data
        },
        templatesByStatus,
        changeFrequency: {
          daily: Math.floor(Math.random() * 5), // Mock data
          weekly: Math.floor(Math.random() * 20), // Mock data
          monthly: Math.floor(Math.random() * 80) // Mock data
        }
      };
      
      return enhancedAnalytics;
    } catch (error) {
      logger.error('Failed to get enhanced analytics', {
        error, 
        orgId: params.orgId
      });
      throw error instanceof RateError
        ? error
        : new RateError('Failed to get enhanced analytics', {
          code: RateErrorCode.UNKNOWN,
          cause: error,
          context: params
        });
    }
  }

  /**
   * Get service health metrics
   */
  async getServiceHealth() {
    try {
      return {
        status: 'healthy' as const,
        responseTime: Math.random() * 100, // Mock response time
        uptime: 99.99,
        metrics: {
          requestsPerMinute: 42,
          averageResponseTimeMs: 87,
          errorRate: 0.02
        },
        recentSpans: this.monitoring ? [] : []
      };
    } catch (error) {
      logger.error('Failed to get service health', { error });
      throw new RateError('Failed to get service health', {
        code: RateErrorCode.UNKNOWN,
        cause: error
      });
    }
  }

  /**
   * Restore a template to a previous version
   */
  async restoreVersion(
    templateId: string,
    version: number
  ): Promise<RateTemplate> {
    try {
      // Get template history
      const history = await this.getRateTemplateHistory(templateId);
      
      // Find the version we want to restore
      const versionEntry = history.data.find(entry => entry.version === version);
      if (!versionEntry) {
        throw RateError.notFound(`Template version ${version} not found`, {
          templateId,
          version
        });
      }
      
      // Get current template
      const currentTemplate = await this.getRateTemplate(templateId);
      
      // Apply changes from history to restore version
      const restoredData = {
        ...currentTemplate,
        ...versionEntry.changes,
        version: currentTemplate.version + 1, // Increment version
        updatedAt: new Date().toISOString()
      };
      
      // Update the template with restored data
      return await this.updateRateTemplate(templateId, restoredData);
    } catch (error) {
      logger.error('Failed to restore template version', {
        error,
        templateId,
        version
      });
      throw error instanceof RateError
        ? error
        : new RateError('Failed to restore template version', {
          code: RateErrorCode.UNKNOWN,
          cause: error,
          context: { templateId, version }
        });
    }
  }

  /**
   * Start a bulk validation operation
   */
  async bulkValidate(
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
  }> {
    try {
      // Create operation ID
      const operationId = `bulk_validate_${Date.now()}`;
      
      // Initialize progress tracking
      this.bulkOperations.set(operationId, {
        status: 'pending',
        progress: {
          total: templateIds.length,
          completed: 0,
          inProgress: templateIds.length,
          failed: 0,
          succeededIds: [],
          failedIds: []
        }
      });
      
      // Start background processing
      this.processBulkValidation(operationId, templateIds);
      
      return {
        operationId,
        status: 'pending',
        progress: {
          total: templateIds.length,
          completed: 0,
          inProgress: templateIds.length,
          failed: 0,
          succeededIds: [],
          failedIds: []
        }
      };
    } catch (error) {
      logger.error('Failed to start bulk validation', {
        error,
        templateCount: templateIds.length
      });
      throw new RateError('Failed to start bulk validation', {
        code: RateErrorCode.UNKNOWN,
        cause: error,
        context: { templateCount: templateIds.length }
      });
    }
  }

  /**
   * Get status of a bulk operation
   */
  async getBulkOperationStatus(
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
  }> {
    const operation = this.bulkOperations.get(operationId);
    
    if (!operation) {
      throw RateError.notFound(`Operation ${operationId} not found`);
    }
    
    return {
      operationId,
      ...operation
    };
  }

  /**
   * Process a bulk validation operation in the background
   * This would likely be a job queue in a real implementation
   */
  private async processBulkValidation(operationId: string, templateIds: string[]) {
    // Get operation from map
    const operation = this.bulkOperations.get(operationId);
    if (!operation) return;
    
    // Update status to processing
    operation.status = 'processing';
    this.bulkOperations.set(operationId, operation);
    
    try {
      // Process each template
      for (const templateId of templateIds) {
        try {
          if (!this.awardValidator) {
            throw new Error('Award validator not available');
          }
          
          // Get template
          const template = await this.getRateTemplate(templateId);
          
          // Validate template
          await this.awardValidator.validateRateAgainstAward(template);
          
          // Update progress
          operation.progress.completed += 1;
          operation.progress.inProgress -= 1;
          operation.progress.succeededIds.push(templateId);
        } catch (error) {
          // Handle validation error for this template
          logger.error('Validation failed for template in bulk operation', {
            error,
            templateId,
            operationId
          });
          
          // Update progress
          operation.progress.failed += 1;
          operation.progress.inProgress -= 1;
          operation.progress.failedIds.push(templateId);
        }
        
        // Update operation in map
        this.bulkOperations.set(operationId, operation);
      }
      
      // Mark as completed once all done
      operation.status = 'completed';
      this.bulkOperations.set(operationId, operation);
    } catch (error) {
      // Handle overall process failure
      logger.error('Bulk validation process failed', { error, operationId });
      
      operation.status = 'failed';
      this.bulkOperations.set(operationId, operation);
    }
  }
}
