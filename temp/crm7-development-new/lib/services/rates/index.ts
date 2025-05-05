import { logger } from '@/lib/utils/logger';
import type { FairWorkService } from '@/lib/services/fairwork/index';
import { RateManagementServiceImpl } from './rate-management-service';
import { defaultRateHooks, type RateHooks } from './lifecycle-hooks';
import {
  RateTemplateStatus,
  type BulkCalculation,
  type BulkCalculationParams,
  type RateAnalytics,
  type RateCalculation,
  type RateEmployee,
  type RateTemplate,
  type RateTemplateHistory,
  type RatesService,
} from './types';
import { RateError, RateErrorCode } from './errors';
import { RateServiceMonitoring } from './monitoring';
import type { MetricsCollector } from './metrics-collector';

export interface RateServiceOptions {
  hooks?: Partial<RateHooks>;
  enableMetrics?: boolean;
  enableTransactions?: boolean;
  /** Enable detailed operation tracing */
  enableMonitoring?: boolean;
  /** Rate limiter for controlling request frequency */
  rateLimiter?: { isAllowed: (key: string) => Promise<boolean> };
  /** Metrics collector for monitoring and observability */
  metricsCollector?: {
    incrementCounter: (name: string, value?: number, options?: Record<string, any>) => void;
    recordTimer: (name: string, valueMs: number, options?: Record<string, any>) => void;
    setGauge: (name: string, value: number, options?: Record<string, any>) => void;
    recordDistribution: (name: string, value: number, options?: Record<string, any>) => void;
    timeAsync: <T>(name: string, fn: () => Promise<T>, options?: Record<string, any>) => Promise<T>;
  };
  /** Cache for improved performance */
  cache?: {
    get: <T>(key: string) => T | undefined;
    set: <T>(key: string, data: T, ttlMs: number) => void;
    getOrSet: <T>(key: string, fetcher: () => Promise<T>, ttlMs: number) => Promise<T>;
    invalidate: (key: string) => void;
  };
  /** Default cache TTL in milliseconds */
  cacheTtlMs?: number;
}

export class RateServiceImpl implements RatesService {
  private readonly rateManagementService: RateManagementServiceImpl;
  private readonly hooks: RateHooks;
  private readonly enableMetrics: boolean;
  private readonly enableTransactions: boolean;
  private readonly enableMonitoring: boolean;
  private readonly rateLimiter?: { isAllowed: (key: string) => Promise<boolean> };
  private readonly metricsCollector?: RateServiceOptions['metricsCollector'];
  private readonly cache?: RateServiceOptions['cache'];
  private readonly cacheTtlMs: number;
  private readonly monitoring?: RateServiceMonitoring;

  constructor(fairWorkService: FairWorkService, options: RateServiceOptions = {}) {
    this.rateManagementService = new RateManagementServiceImpl(fairWorkService);
    this.hooks = { ...defaultRateHooks, ...options.hooks };
    this.enableMetrics = options.enableMetrics ?? false;
    this.enableTransactions = options.enableTransactions ?? false;
    this.enableMonitoring = options.enableMonitoring ?? false;
    this.rateLimiter = options.rateLimiter;
    this.metricsCollector = options.metricsCollector;
    this.cache = options.cache;
    this.cacheTtlMs = options.cacheTtlMs ?? 5 * 60 * 1000; // Default 5 minutes
    
    // Set up monitoring if enabled
    if (this.enableMonitoring) {
      this.monitoring = new RateServiceMonitoring(this.metricsCollector as MetricsCollector);
    }
  }

  async getTemplates({ org_id }: { org_id: string }): Promise<{ data: RateTemplate[] }> {
    try {
      // Apply rate limiting if enabled
      if (this.rateLimiter) {
        const operationKey = `getTemplates:${org_id}`;
        await this.rateLimiter.isAllowed(operationKey);
      }

      const templates = await this.rateManagementService.getRateTemplates(org_id);
      
      // Track metrics if enabled
      if (this.enableMetrics) {
        logger.debug('Tracking template fetch metric', { 
          org_id, 
          count: templates.length,
          timestamp: new Date().toISOString() 
        });
      }
      
      return { data: templates };
    } catch (error) {
      logger.error('Failed to get templates', { error, org_id });
      throw new RateError('Failed to get templates', { cause: error });
    }
  }

  async getRateTemplate(id: string): Promise<RateTemplate> {
    try {
      // Apply rate limiting if enabled
      if (this.rateLimiter) {
        const operationKey = `getRateTemplate:${id}`;
        await this.rateLimiter.isAllowed(operationKey);
      }
      
      const template = await this.rateManagementService.getRateTemplate(id);
      
      if (!template) {
        throw RateError.notFound(`Template ${id} not found`, { id });
      }
      
      return template;
    } catch (error) {
      logger.error('Failed to get template', { error, id });
      throw error instanceof RateError
        ? error
        : new RateError('Failed to get template', { 
          code: RateErrorCode.NOT_FOUND, 
          cause: error,
          context: { id } 
        });
    }
  }

  async createRateTemplate(template: Partial<RateTemplate>): Promise<RateTemplate> {
    try {
      // Apply rate limiting if enabled
      if (this.rateLimiter) {
        await this.rateLimiter.isAllowed('createRateTemplate');
      }
      
      // Track metrics if enabled
      if (this.metricsCollector) {
        this.metricsCollector.incrementCounter('template.create.attempt', 1, {
          labels: { templateType: template.templateType }
        });
      }

      // Apply beforeCreate hook
      const processedTemplate = this.hooks.beforeCreate 
        ? await this.hooks.beforeCreate(template)
        : template;

      // Use metrics collector to time the operation if available
      if (this.metricsCollector) {
        return await this.metricsCollector.timeAsync('template.create.duration', async () => {
          const createdTemplate = await this.rateManagementService
            .createRateTemplate(processedTemplate);
          
          // Apply afterCreate hook
          const finalTemplate = this.hooks.afterCreate 
            ? await this.hooks.afterCreate(createdTemplate)
            : createdTemplate;
            
          // Track success metric
          this.metricsCollector?.incrementCounter('template.create.success');
          
          return finalTemplate;
        });
      } else {
        const createdTemplate = await this.rateManagementService
          .createRateTemplate(processedTemplate);
        
        // Apply afterCreate hook
        const finalTemplate = this.hooks.afterCreate 
          ? await this.hooks.afterCreate(createdTemplate)
          : createdTemplate;
          
        return finalTemplate;
      }
    } catch (error) {
      // Track failure metric
      if (this.metricsCollector) {
        this.metricsCollector.incrementCounter('template.create.error');
      }
      
      logger.error('Failed to create template', { error });
      throw error instanceof RateError
        ? error
        : new RateError('Failed to create template', { 
          code: RateErrorCode.UNKNOWN,
          cause: error,
          context: { templateName: template.name }
        });
    }
  }

  async updateRateTemplate(id: string, template: Partial<RateTemplate>): Promise<RateTemplate> {
    try {
      // Get previous data if available
      let previousData: RateTemplate | undefined;
      try {
        previousData = await this.rateManagementService.getRateTemplate(id) || undefined;
      } catch (e) {
        // Intentionally ignore errors when fetching previous data
        logger.debug('Could not fetch previous template data', { id, error: e });
      }

      // Apply beforeUpdate hook
      const updateParams = { id, data: template, previousData };
      const processedParams = this.hooks.beforeUpdate
        ? await this.hooks.beforeUpdate(updateParams)
        : updateParams;

      const updatedTemplate = await this.rateManagementService
        .updateRateTemplate(processedParams.id, processedParams.data);
      
      // Apply afterUpdate hook
      const finalTemplate = this.hooks.afterUpdate
        ? await this.hooks.afterUpdate(updatedTemplate)
        : updatedTemplate;
        
      return finalTemplate;
    } catch (error) {
      logger.error('Failed to update template', { error, id });
      throw new RateError('Failed to update template', { cause: error });
    }
  }

  async updateRateTemplateStatus(
    id: string,
    status: RateTemplateStatus,
    updatedBy: string
  ): Promise<void> {
    try {
      // Apply beforeStatusChange hook
      const params = { id, status, updatedBy };
      const processedParams = this.hooks.beforeStatusChange
        ? await this.hooks.beforeStatusChange(params)
        : params;

      await this.rateManagementService.updateRateTemplateStatus(
        processedParams.id, 
        processedParams.status, 
        processedParams.updatedBy
      );

      // Apply afterStatusChange hook
      if (this.hooks.afterStatusChange) {
        await this.hooks.afterStatusChange({ id, status, updatedBy });
      }

      // Track metrics if enabled
      if (this.enableMetrics) {
        logger.debug('Tracking status change metric', { 
          id, 
          status, 
          timestamp: new Date().toISOString() 
        });
        // Here you would send metrics to your monitoring system
      }
    } catch (error) {
      logger.error('Failed to update template status', { error, id });
      throw new RateError('Failed to update template status', { cause: error });
    }
  }

  async deleteRateTemplate(id: string): Promise<void> {
    try {
      // Apply beforeDelete hook
      const processedId = this.hooks.beforeDelete
        ? await this.hooks.beforeDelete(id)
        : id;

      await this.rateManagementService.deleteRateTemplate(processedId);

      // Apply afterDelete hook
      if (this.hooks.afterDelete) {
        await this.hooks.afterDelete(id);
      }

      // Track metrics if enabled
      if (this.enableMetrics) {
        logger.debug('Tracking template deletion metric', { 
          id, 
          timestamp: new Date().toISOString() 
        });
      }
    } catch (error) {
      logger.error('Failed to delete template', { error, id });
      throw new RateError('Failed to delete template', { cause: error });
    }
  }

  async getRateTemplateHistory(id: string): Promise<{ data: RateTemplateHistory[] }> {
    try {
      const history = await this.rateManagementService.getRateTemplateHistory(id);
      return { data: history };
    } catch (error) {
      logger.error('Failed to get template history', { error, id });
      throw new RateError('Failed to get template history', { cause: error });
    }
  }

  async getRateCalculations(id: string): Promise<{ data: RateCalculation[] }> {
    try {
      const calculations = await this.rateManagementService.getRateCalculations(id);
      return { data: calculations };
    } catch (error) {
      logger.error('Failed to get rate calculations', { error, id });
      throw new RateError('Failed to get rate calculations', { cause: error });
    }
  }

  async validateRateTemplate(template: RateTemplate): Promise<boolean> {
    try {
      const result = await this.rateManagementService.validateRateTemplate(template);
      return result.isValid;
    } catch (error) {
      logger.error('Failed to validate template', { error });
      throw new RateError('Failed to validate template', { cause: error });
    }
  }

  async calculateRate(template: RateTemplate): Promise<number> {
    try {
      const result = await this.rateManagementService.calculateRate(template);
      return result.rate;
    } catch (error) {
      logger.error('Failed to calculate rate', { error });
      throw new RateError('Failed to calculate rate', { cause: error });
    }
  }

  async getBulkCalculations(orgId: string): Promise<{ data: BulkCalculation[] }> {
    try {
      const calculations = await this.rateManagementService.getBulkCalculations(orgId);
      return { data: calculations };
    } catch (error) {
      logger.error('Failed to get bulk calculations', { error, orgId });
      throw new RateError('Failed to get bulk calculations', { cause: error });
    }
  }

  async createBulkCalculation(params: BulkCalculationParams): Promise<{ data: BulkCalculation }> {
    try {
      const calculation = await this.rateManagementService.createBulkCalculation(params);
      return { data: calculation };
    } catch (error) {
      logger.error('Failed to create bulk calculation', { error, params });
      throw new RateError('Failed to create bulk calculation', { cause: error });
    }
  }

  async getAnalytics(params: { orgId: string }): Promise<RateAnalytics> {
    try {
      const analytics = await this.rateManagementService.getAnalytics(params.orgId);
      return analytics;
    } catch (error) {
      logger.error('Failed to get analytics', { error, orgId: params.orgId });
      throw new RateError('Failed to get analytics', { cause: error });
    }
  }

  async getEmployees(): Promise<{ data: RateEmployee[] }> {
    try {
      const employees = await this.rateManagementService.getEmployees();
      return { data: employees };
    } catch (error) {
      logger.error('Failed to get employees', { error });
      throw new RateError('Failed to get employees', { cause: error });
    }
  }
}

export {
  RateError,
  RateTemplateStatus,
  type BulkCalculation,
  type RateAnalytics,
  type RateCalculation,
  type RateEmployee,
  type RateTemplate,
  type RateTemplateHistory,
  type RatesService
};
