import { type SupabaseClient } from '@supabase/supabase-js';
import { type Database } from '@/types/supabase';
import { BaseService, type ServiceOptions } from '@/lib/utils/service';

interface FairWorkTemplate {
  id: string;
  name: string;
  baseRate: number;
  effectiveFrom: string;
  effectiveTo?: string;
}

export class FairWorkService extends BaseService {
  constructor(private readonly supabase: SupabaseClient<Database>, options: ServiceOptions = {}) {
    super('FairWorkService', '1.0.0', options);
  }

  async getTemplates(): Promise<void> {
    return this.executeServiceMethod('getTemplates', async (): Promise<any> => {
      const { data, error } = await this.supabase
        .from('fairwork_templates')
        .select();

      if (typeof error !== "undefined" && error !== null) {
        throw error;
      }

      return data;
    });
  }

  async getTemplate(id: string): Promise<void> {
    return this.executeServiceMethod('getTemplate', async (): Promise<any> => {
      const { data, error } = await this.supabase
        .from('fairwork_templates')
        .select()
        .eq('id', id)
        .single();

      if (typeof error !== "undefined" && error !== null) {
        throw error;
      }

      return data;
    });
  }

  async createTemplate(template: Omit<FairWorkTemplate, 'id'>): Promise<void> {
    return this.executeServiceMethod('createTemplate', async (): Promise<any> => {
      const { data, error } = await this.supabase
        .from('fairwork_templates')
        .insert(template)
        .select()
        .single();

      if (typeof error !== "undefined" && error !== null) {
        throw error;
      }

      return data;
    });
  }

  async updateTemplate(id: string, updates: Partial<FairWorkTemplate>): Promise<void> {
    return this.executeServiceMethod('updateTemplate', async (): Promise<any> => {
      const { data, error } = await this.supabase
        .from('fairwork_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (typeof error !== "undefined" && error !== null) {
        throw error;
      }

      return data;
    });
  }

  async getRates(params: {
    template_id?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<void> {
    return this.executeServiceMethod('getRates', async (): Promise<any> => {
      let query = this.supabase.from('fairwork_templates').select();

      if (params.template_id) {
        query = query.eq('id', params.template_id);
      }

      if (params.start_date) {
        query = query.gte('effectiveFrom', params.start_date);
      }

      if (params.end_date) {
        query = query.lte('effectiveTo', params.end_date);
      }

      const { data, error } = await query;

      if (typeof error !== "undefined" && error !== null) {
        throw error;
      }

      return data;
    });
  }
}
