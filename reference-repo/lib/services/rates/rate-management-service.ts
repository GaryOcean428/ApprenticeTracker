import { type PostgrestError, type SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/utils/logger';
import type { FairWorkService } from '../fairwork/index';
import {
  type RateTemplate,
  type RateTemplateHistory,
  type RateCalculation,
  type BulkCalculation,
  RateTemplateStatus,
  type RateAnalytics
} from './types';

export class RateManagementServiceImpl {
  private readonly client: SupabaseClient;

  constructor(private readonly fairWorkService: FairWorkService) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase environment variables');
    }
    this.client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }

  async getRateTemplates(orgId: string): Promise<RateTemplate[]> {
    try {
      const { data, error } = await this.client
        .from('rate_templates')
        .select('*')
        .eq('orgId', orgId)
        .order('createdAt', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Failed to fetch rate templates', { error });
      throw error;
    }
  }

  async getRateTemplate(id: string): Promise<RateTemplate | null> {
    try {
      const { data, error } = await this.client
        .from('rate_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Failed to fetch rate template', { error });
      throw error;
    }
  }

  async getRateTemplateHistory(id: string): Promise<RateTemplateHistory[]> {
    try {
      const { data, error } = await this.client
        .from('rate_template_history')
        .select('*')
        .eq('template_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Failed to fetch template history', { error });
      throw error;
    }
  }

  async getRateCalculations(id: string): Promise<RateCalculation[]> {
    try {
      const { data, error } = await this.client
        .from('rate_calculations')
        .select('*')
        .eq('template_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Failed to fetch calculations', { error });
      throw error;
    }
  }

  async validateRateTemplate(template: RateTemplate): Promise<{ isValid: boolean }> {
    try {
      // Implement validation logic here
      return { isValid: true };
    } catch (error) {
      logger.error('Failed to validate template', { error });
      throw error;
    }
  }

  async calculateRate(template: RateTemplate): Promise<{ rate: number }> {
    try {
      // Implement rate calculation logic here
      return { rate: 0 };
    } catch (error) {
      logger.error('Failed to calculate rate', { error });
      throw error;
    }
  }

  async getBulkCalculations(orgId: string): Promise<BulkCalculation[]> {
    try {
      const { data, error } = await this.client
        .from('bulk_calculations')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Failed to fetch bulk calculations', { error });
      throw error;
    }
  }

  async createBulkCalculation(params: {
    orgId: string;
    templateIds: string[];
  }): Promise<BulkCalculation> {
    try {
      const { data, error } = await this.client
        .from('bulk_calculations')
        .insert({
          org_id: params.orgId,
          template_ids: params.templateIds,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Failed to create bulk calculation', { error });
      throw error;
    }
  }

  async createRateTemplate(template: Partial<RateTemplate>): Promise<RateTemplate> {
    try {
      const { data, error } = await this.client
        .from('rate_templates')
        .insert(template)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Failed to create rate template', { error });
      throw error;
    }
  }

  async updateRateTemplate(id: string, template: Partial<RateTemplate>): Promise<RateTemplate> {
    try {
      const { data, error } = await this.client
        .from('rate_templates')
        .update(template)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Failed to update rate template', { error });
      throw error;
    }
  }

  async updateRateTemplateStatus(id: string, status: RateTemplateStatus, updatedBy: string): Promise<void> {
    try {
      const { error } = await this.client
        .from('rate_templates')
        .update({ status, updated_by: updatedBy })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      logger.error('Failed to update rate template status', { error });
      throw error;
    }
  }

  async deleteRateTemplate(id: string): Promise<void> {
    try {
      const { error } = await this.client
        .from('rate_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      logger.error('Failed to delete rate template', { error });
      throw error;
    }
  }

  async getAnalytics(orgId: string): Promise<{ data: RateAnalytics }> {
    try {
      const { data: templates, error: templatesError } = await this.client
        .from('rate_templates')
        .select('*')
        .eq('orgId', orgId);

      if (templatesError) throw templatesError;

      const analytics: RateAnalytics = {
        totalTemplates: templates?.length ?? 0,
        activeTemplates: templates?.filter(t => t.status === 'active').length ?? 0,
        averageRate: 0, // Calculate this based on your requirements
        recentChanges: templates?.slice(-5).map(t => ({
          action: t.created_at === t.updated_at ? 'created' : 'updated',
          timestamp: t.updated_at,
        })) ?? [],
      };

      return { data: analytics };
    } catch (error) {
      logger.error('Failed to get analytics', { error });
      throw error;
    }
  }
}

export { RateManagementServiceImpl as RateManagementService };
