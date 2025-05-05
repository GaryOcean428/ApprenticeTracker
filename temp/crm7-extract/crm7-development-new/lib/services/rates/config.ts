/**
 * Rate Service Configuration
 * 
 * This module provides centralized configuration for the rate service,
 * enabling easier customization of service behavior.
 * 
 * Inspired by the atomic-crm's Configurati  // Create and return the service instance
  if (finalConfig.useEnhancedService === true) {
    logger.debug('Creating enhanced rate service instance');
    return new EnhancedRateServiceImpl(fairWorkService, serviceOptions);
  } else {
    logger.debug('Creating standard rate service instance');
    return new RateServiceImpl(fairWorkService, serviceOptions);
  }Provider pattern.
 */

import { logger } from '@/lib/utils/logger';
import { createActivityTrackingHooks } from './activity-tracking';
import type { RateHooks } from './lifecycle-hooks';
import { RateServiceImpl, type RateServiceOptions } from './index';
import { EnhancedRateServiceImpl, type EnhancedRateServiceOptions } from './enhanced-service';
import type { FairWorkService } from '@/lib/services/fairwork/index';
import type { RatesService } from './types';
import type { EnhancedRateService } from './enhanced-types';
import { RateLimiter } from './rate-limiter';
import { MetricsCollector } from './metrics-collector';
import { RateCache } from './rate-cache';

export interface RateServiceConfiguration {
  /**
   * Enable tracking of metrics (usage patterns, performance data)
   */
  enableMetrics: boolean;
  
  /**
   * Enable activity tracking for audit and analytics
   */
  enableActivityTracking: boolean;
  
  /**
   * User ID for attribution of changes
   */
  userId?: string;
  
  /**
   * Organization ID for multi-tenant isolation
   */
  orgId?: string;
  
  /**
   * Custom hooks to extend or override default behavior
   */
  customHooks?: Partial<RateHooks>;
  
  /**
   * Log level for rate service operations
   */
  logLevel?: 'debug' | 'info' | 'warn' | 'error';

  /**
   * Enable rate limiting for service operations
   */
  enableRateLimiting?: boolean;

  /**
   * Rate limiting options
   */
  rateLimitOptions?: {
    limit: number;
    windowMs: number;
    strict?: boolean;
  };

  /**
   * Enable transaction support
   */
  enableTransactions?: boolean;
  
  /**
   * Enable caching for better performance
   */
  enableCaching?: boolean;
  
  /**
   * Cache TTL in milliseconds
   */
  cacheTtlMs?: number;
  
  /**
   * Metrics namespace for the rates service
   */
  metricsNamespace?: string;
  
  /**
   * Enable detailed operation tracing
   */
  enableMonitoring?: boolean;
  
  /**
   * Enable award validation using the FairWork service
   */
  enableAwardValidation?: boolean;
  
  /**
   * Use enhanced rate service with additional features
   */
  useEnhancedService?: boolean;
}

// Default configuration
const defaultConfig: RateServiceConfiguration = {
  enableMetrics: process.env.NODE_ENV === 'production',
  enableActivityTracking: process.env.NODE_ENV === 'production',
  logLevel: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  enableRateLimiting: process.env.NODE_ENV === 'production',
  rateLimitOptions: {
    limit: 100, // 100 requests
    windowMs: 60 * 1000, // per minute
    strict: false // Just log warnings in production, don't block
  },
  enableTransactions: true, // Enable transaction support by default
  enableCaching: true, // Enable caching by default
  cacheTtlMs: 5 * 60 * 1000, // 5 minutes cache TTL by default
  metricsNamespace: 'crm7r.rates', // Default metrics namespace
  enableMonitoring: process.env.NODE_ENV === 'production',
  enableAwardValidation: true, // Enable award validation by default
  useEnhancedService: true // Use enhanced service by default
};

/**
 * Creates a configured rate service instance
 */
export function createConfiguredRateService(
  fairWorkService: FairWorkService,
  config: Partial<RateServiceConfiguration> = {}
): RatesService | EnhancedRateService {
  // Merge with defaults
  const finalConfig: RateServiceConfiguration = {
    ...defaultConfig,
    ...config
  };
  
  // Configure logging
  if (finalConfig.logLevel) {
    // Configure logging based on level
    const logLevel = finalConfig.logLevel;
    logger.debug(`Setting rate service log level to ${logLevel}`);
  }
  
  // Setup metrics collector if enabled
  let metricsCollector: MetricsCollector | undefined;
  if (finalConfig.enableMetrics === true) {
    const namespace = finalConfig.metricsNamespace ?? 'crm7r.rates';
    metricsCollector = new MetricsCollector(namespace, true);
  }
  
  // Setup rate limiter if enabled
  let rateLimiter: RateLimiter | undefined;
  if (finalConfig.enableRateLimiting === true && finalConfig.rateLimitOptions) {
    rateLimiter = new RateLimiter(finalConfig.rateLimitOptions);
  }
  
  // Setup cache if enabled
  let rateCache: RateCache | undefined;
  if (finalConfig.enableCaching === true) {
    rateCache = new RateCache();
  }
  
  // Build service options
  const serviceOptions: EnhancedRateServiceOptions = {
    enableMetrics: finalConfig.enableMetrics,
    hooks: finalConfig.customHooks ? { ...finalConfig.customHooks } : undefined,
    enableTransactions: finalConfig.enableTransactions ?? false,
    enableMonitoring: finalConfig.enableMonitoring ?? false,
    enableAwardValidation: finalConfig.enableAwardValidation ?? false,
    rateLimiter,
    metricsCollector,
    cache: rateCache,
    cacheTtlMs: finalConfig.cacheTtlMs
  };
  
  // Add activity tracking hooks if enabled
  if (finalConfig.enableActivityTracking && finalConfig.userId && finalConfig.orgId) {
    const activityHooks = createActivityTrackingHooks(finalConfig.userId, finalConfig.orgId);
    serviceOptions.hooks = {
      ...serviceOptions.hooks,
      afterCreate: async (template) => {
        // Run custom hook if exists
        if (serviceOptions.hooks?.afterCreate) {
          template = await serviceOptions.hooks.afterCreate(template);
        }
        // Run activity tracking hook
        return activityHooks.afterCreate(template);
      },
      afterUpdate: async (template) => {
        // Run custom hook if exists
        if (serviceOptions.hooks?.afterUpdate) {
          template = await serviceOptions.hooks.afterUpdate(template);
        }
        // Run activity tracking hook
        return activityHooks.afterUpdate(template);
      },
      afterStatusChange: async (params) => {
        // Run custom hook if exists
        if (serviceOptions.hooks?.afterStatusChange) {
          await serviceOptions.hooks.afterStatusChange(params);
        }
        // Run activity tracking hook
        await activityHooks.afterStatusChange(params);
      },
      afterDelete: async (id) => {
        // Run custom hook if exists
        if (serviceOptions.hooks?.afterDelete) {
          await serviceOptions.hooks.afterDelete(id);
        }
        // Run activity tracking hook
        await activityHooks.afterDelete(id);
      }
    };
  }
  
  // Create and return service instance
  return new RateServiceImpl(fairWorkService, serviceOptions);
}
