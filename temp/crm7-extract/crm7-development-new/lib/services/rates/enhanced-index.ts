/**
 * Enhanced Rate Service Package
 * 
 * This file re-exports all enhanced rate service features for easy importing.
 */

// Core Service
export {
  RateServiceImpl,
  RateServiceOptions,
  RateError,
  RateTemplateStatus,
} from './index';

// Enhanced Service
export {
  EnhancedRateServiceImpl,
  EnhancedRateServiceOptions
} from './enhanced-service';

// Configuration
export {
  createConfiguredRateService,
  RateServiceConfiguration
} from './config';

// Enhanced Types
export * from './enhanced-types';

// Error Handling
export {
  RateErrorCode
} from './errors';

// Utilities
export {
  MetricsCollector,
  MetricType,
  MetricOptions
} from './metrics-collector';

export {
  RateCache,
  CacheStats
} from './rate-cache';

export {
  RateServiceMonitoring,
  SpanStatus
} from './monitoring';

export {
  AwardRateValidator,
  AwardRateValidationResult,
  AwardRateSuggestion
} from './award-integration';

// Event Schema
export * from './event-schema';

// Default Hooks
export {
  defaultRateHooks,
  createActivityTrackingHooks
} from './lifecycle-hooks';
