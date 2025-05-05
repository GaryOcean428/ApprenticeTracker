/**
 * Rate Activity Logger - Inspired by atomic-crm architecture
 * 
 * This module provides activity tracking for the rates service,
 * allowing for better visibility into user actions and system events.
 */
import { logger } from '@/lib/utils/logger';
import type { RateTemplate, RateTemplateStatus } from './types';

export enum ActivityType {
  TEMPLATE_CREATED = 'template_created',
  TEMPLATE_UPDATED = 'template_updated',
  TEMPLATE_STATUS_CHANGED = 'template_status_changed',
  TEMPLATE_DELETED = 'template_deleted',
  RATE_CALCULATED = 'rate_calculated',
  BULK_CALCULATION = 'bulk_calculation'
}

export interface Activity {
  id: string;
  type: ActivityType;
  timestamp: string;
  userId: string;
  orgId: string;
  details: Record<string, unknown>;
  metadata?: {
    environment?: string;
    service?: string;
    version?: string;
    ip?: string;
    userAgent?: string;
    requestId?: string;
    correlationId?: string;
    source?: string;
    severity?: 'low' | 'medium' | 'high';
    tags?: string[];
  };
}

/**
 * Records rate-related activity for audit and analytics purposes
 * @returns void
 */
export async function recordActivity(
  type: ActivityType,
  userId: string,
  orgId: string,
  details: Record<string, unknown>,
  metadata?: {
    ip?: string;
    userAgent?: string;
    requestId?: string;
    correlationId?: string;
    source?: string;
    severity?: 'low' | 'medium' | 'high';
    tags?: string[];
  }
): Promise<void> {
  try {
    const activity = {
      id: `${type}_${Date.now()}`,
      type,
      timestamp: new Date().toISOString(),
      userId,
      orgId,
      details,
      metadata: {
        ...metadata,
        environment: process.env.NODE_ENV ?? 'development',
        service: 'rates-service',
        version: process.env.APP_VERSION ?? '1.0.0',
      }
    };

    // Log activity for analytics and debugging
    logger.info('Rate activity recorded', activity);

    // In a production system, you would store this in a database
    // await database.insert('rate_activities', activity);
    
    // Could also send to external monitoring systems
    // await monitoringService.trackEvent('rate_activity', activity);
  } catch (error) {
    // Log but don't throw - activity recording should not break main functionality
    logger.error('Failed to record rate activity', { error, type, userId, orgId });
  }
}

/**
 * Creates hooks that automatically record activity
 */
export function createActivityTrackingHooks(userId: string, orgId: string) {
  return {
    afterCreate: async (template: RateTemplate) => {
      await recordActivity(
        ActivityType.TEMPLATE_CREATED,
        userId,
        orgId,
        {
          templateId: template.id,
          templateName: template.name
        }
      );
      return template;
    },

    afterUpdate: async (template: RateTemplate) => {
      await recordActivity(
        ActivityType.TEMPLATE_UPDATED,
        userId,
        orgId,
        {
          templateId: template.id,
          templateName: template.name
        }
      );
      return template;
    },

    afterStatusChange: async (params: { id: string; status: RateTemplateStatus }) => {
      await recordActivity(
        ActivityType.TEMPLATE_STATUS_CHANGED,
        userId,
        orgId,
        {
          templateId: params.id,
          newStatus: params.status
        }
      );
    },

    afterDelete: async (id: string) => {
      await recordActivity(
        ActivityType.TEMPLATE_DELETED,
        userId,
        orgId,
        {
          templateId: id
        }
      );
    }
  };
}

/**
 * Retrieves recent rate-related activities
 * In a real implementation, this would fetch from a database
 */
export async function getRateActivities(
  orgId: string, 
  options: { limit?: number; type?: ActivityType }
): Promise<Activity[]> {
  try {
    // In a real implementation, this would be a database query
    logger.info('Fetching rate activities', { orgId, options });
    
    // Mock implementation - in production, this would be a database call
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Mock response for now
    return [
      {
        id: 'mock_activity_1',
        type: ActivityType.TEMPLATE_CREATED,
        timestamp: new Date().toISOString(),
        userId: 'system',
        orgId,
        details: { templateId: 'mock_template_1', templateName: 'Sample Template' },
        metadata: {
          environment: 'development',
          service: 'rates-service',
          version: '1.0.0',
        }
      }
    ];
  } catch (error) {
    logger.error('Failed to get rate activities', { error, orgId });
    return [];
  }
}
