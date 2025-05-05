/**
 * Event schema for rates service events
 * These events can be emitted and consumed by other services
 */

/**
 * Base interface for all rate-related events
 */
export interface RateEvent {
  eventId: string;
  eventType: string;
  timestamp: string;
  orgId: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Event emitted when a rate template is created
 */
export interface RateTemplateCreatedEvent extends RateEvent {
  eventType: 'rate.template.created';
  data: {
    templateId: string;
    name: string;
    templateType: string;
    baseRate: number;
    effectiveFrom: string;
    effectiveTo?: string;
    status: string;
  };
}

/**
 * Event emitted when a rate template is updated
 */
export interface RateTemplateUpdatedEvent extends RateEvent {
  eventType: 'rate.template.updated';
  data: {
    templateId: string;
    name: string;
    changes: Record<string, unknown>;
    previousValues?: Record<string, unknown>;
    version: number;
  };
}

/**
 * Event emitted when a rate template status changes
 */
export interface RateTemplateStatusChangedEvent extends RateEvent {
  eventType: 'rate.template.status.changed';
  data: {
    templateId: string;
    name: string;
    previousStatus: string;
    newStatus: string;
    reason?: string;
  };
}

/**
 * Event emitted when a rate template is deleted
 */
export interface RateTemplateDeletedEvent extends RateEvent {
  eventType: 'rate.template.deleted';
  data: {
    templateId: string;
    name: string;
  };
}

/**
 * Event emitted when a bulk calculation is started
 */
export interface BulkCalculationStartedEvent extends RateEvent {
  eventType: 'rate.calculation.bulk.started';
  data: {
    calculationId: string;
    templateCount: number;
    parameters: Record<string, unknown>;
  };
}

/**
 * Event emitted when a bulk calculation is completed
 */
export interface BulkCalculationCompletedEvent extends RateEvent {
  eventType: 'rate.calculation.bulk.completed';
  data: {
    calculationId: string;
    templateCount: number;
    successCount: number;
    failedCount: number;
    durationMs: number;
  };
}

/**
 * Event emitted when a compliance check fails
 */
export interface ComplianceCheckFailedEvent extends RateEvent {
  eventType: 'rate.compliance.check.failed';
  data: {
    templateId: string;
    name: string;
    issues: Array<{
      code: string;
      message: string;
      severity: 'warning' | 'error';
    }>;
    minimumRate?: number;
    actualRate?: number;
  };
}

/**
 * Union type of all rate events
 */
export type RateEventUnion =
  | RateTemplateCreatedEvent
  | RateTemplateUpdatedEvent
  | RateTemplateStatusChangedEvent
  | RateTemplateDeletedEvent
  | BulkCalculationStartedEvent
  | BulkCalculationCompletedEvent
  | ComplianceCheckFailedEvent;
