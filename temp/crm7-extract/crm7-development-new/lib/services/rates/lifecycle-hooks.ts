import { logger } from '@/lib/utils/logger';
import { type RateTemplate, type RateTemplateStatus } from './types';

export type RateHookFunction<T, R> = (data: T) => Promise<R>;

export interface RateHooks {
  beforeCreate?: RateHookFunction<Partial<RateTemplate>, Partial<RateTemplate>>;
  afterCreate?: RateHookFunction<RateTemplate, RateTemplate>;
  beforeUpdate?: RateHookFunction<{ id: string; data: Partial<RateTemplate>; previousData?: RateTemplate }, { id: string; data: Partial<RateTemplate>; previousData?: RateTemplate }>;
  afterUpdate?: RateHookFunction<RateTemplate, RateTemplate>;
  beforeStatusChange?: RateHookFunction<{ id: string; status: RateTemplateStatus; updatedBy: string }, { id: string; status: RateTemplateStatus; updatedBy: string }>;
  afterStatusChange?: RateHookFunction<{ id: string; status: RateTemplateStatus; updatedBy: string }, void>;
  beforeDelete?: RateHookFunction<string, string>;
  afterDelete?: RateHookFunction<string, void>;
}

export const defaultRateHooks: RateHooks = {
  beforeCreate: async (data) => {
    logger.debug('Before creating rate template', { data });
    // Set default values if needed
    return {
      ...data,
      status: data.status ?? RateTemplateStatus.DRAFT
    };
  },
  
  afterCreate: async (template) => {
    logger.debug('After creating rate template', { id: template.id });
    return template;
  },
  
  beforeUpdate: async (params) => {
    logger.debug('Before updating rate template', { id: params.id });
    return params;
  },
  
  afterUpdate: async (template) => {
    logger.debug('After updating rate template', { id: template.id });
    return template;
  },
  
  beforeStatusChange: async (params) => {
    logger.debug('Before changing rate template status', { id: params.id, status: params.status });
    return params;
  },
  
  afterStatusChange: async (params) => {
    logger.debug('After changing rate template status', { id: params.id, status: params.status });
  },
  
  beforeDelete: async (id) => {
    logger.debug('Before deleting rate template', { id });
    return id;
  },
  
  afterDelete: async (id) => {
    logger.debug('After deleting rate template', { id });
  }
};
