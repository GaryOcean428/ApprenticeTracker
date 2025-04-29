import { createClient } from '@supabase/supabase-js';

import type { Database } from '@/types/supabase';

export interface IntegrationConfig {
  id: string;
  org_id: string;
  integration_type: 'payroll' | 'hr' | 'accounting' | 'custom';
  provider: string;
  credentials: Record<string, any>;
  settings: Record<string, any>;
  is_active: boolean;
  metadata?: Record<string, any>;
}

export interface SyncResult {
  success: boolean;
  records_processed: number;
  records_failed: number;
  error_log?: Record<string, any>[];
  metadata?: Record<string, any>;
}

export class RatesIntegrationService {
  private supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  );

  async getIntegrations(org_id: string): Promise<IntegrationConfig[]> {
    const { data, error } = await this.supabase
      .from('integration_configs')
      .select('*')
      .eq('org_id', org_id)
      .eq('is_active', true);

    if (error) throw error;
    return data;
  }

  async syncRates(params: {
    org_id: string;
    integration_id: string;
    sync_type: 'import' | 'export';
    start_date?: Date;
    end_date?: Date;
    options?: Record<string, any>;
  }): Promise<void> {
    const { data, error } = await this.supabase.rpc('sync_rates', params);
    if (typeof error !== "undefined" && error !== null) throw error;
    return data;
  }

  async validateIntegration(config: Partial<IntegrationConfig>): Promise<void> {
    const { data, error } = await this.supabase.rpc('validate_integration', {
      config: config,
    });
    if (typeof error !== "undefined" && error !== null) throw error;
    return data;
  }

  async importRates(params: {
    integration_id: string;
    import_type: 'templates' | 'calculations' | 'both';
    options?: Record<string, any>;
  }): Promise<void> {
    const { data, error } = await this.supabase.rpc('import_rates', params);
    if (typeof error !== "undefined" && error !== null) throw error;
    return data;
  }

  async exportRates(params: {
    integration_id: string;
    export_type: 'templates' | 'calculations' | 'both';
    filters?: Record<string, any>;
    options?: Record<string, any>;
  }): Promise<void> {
    const { data, error } = await this.supabase.rpc('export_rates', params);
    if (typeof error !== "undefined" && error !== null) throw error;
    return data;
  }

  async scheduleSync(params: {
    integration_id: string;
    schedule_type: 'hourly' | 'daily' | 'weekly' | 'monthly';
    sync_type: 'import' | 'export' | 'both';
    options?: Record<string, any>;
  }): Promise<void> {
    const { data, error } = await this.supabase.rpc('schedule_rate_sync', params);
    if (typeof error !== "undefined" && error !== null) throw error;
    return data;
  }

  async getSyncHistory(params: {
    org_id: string;
    integration_id?: string;
    start_date?: Date;
    end_date?: Date;
    status?: string;
    is_active?: boolean;
  }): Promise<any[]> {
    const { org_id, integration_id, start_date, end_date, status, is_active } = params;
    const query = this.supabase.from('integration_sync_history').select('*').eq('org_id', org_id);

    if (typeof integration_id !== "undefined" && integration_id !== null) {
      query.eq('integration_id', integration_id);
    }

    if (typeof start_date !== "undefined" && start_date !== null) {
      query.gte('started_at', start_date.toISOString());
    }

    if (typeof end_date !== "undefined" && end_date !== null) {
      query.lte('started_at', end_date.toISOString());
    }

    if (typeof status !== "undefined" && status !== null) {
      query.eq('status', status);
    }

    if (typeof is_active === 'boolean') {
      query.eq('is_active', is_active ? 'true' : 'false');
    }

    const { data, error } = await query.order('started_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getIntegrationStatus(integration_id: string): Promise<void> {
    const { data, error } = await this.supabase.rpc('get_integration_status', {
      integration_id,
    });
    if (typeof error !== "undefined" && error !== null) throw error;
    return data;
  }

  async createSync(params: {
    org_id: string;
    integration_type: string;
    status: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    const { data, error } = await this.supabase
      .from('integration_sync_history')
      .insert({
        ...params,
        is_active: true,
      })
      .select()
      .single();

    if (typeof error !== "undefined" && error !== null) {
      throw error;
    }

    return data;
  }

  async updateSync(
    id: string,
    params: {
      status?: string;
      is_active?: boolean;
      metadata?: Record<string, any>;
    },
  ): Promise<void> {
    const { data, error } = await this.supabase
      .from('integration_sync_history')
      .update({
        ...params,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (typeof error !== "undefined" && error !== null) {
      throw error;
    }

    return data;
  }
}

export const ratesIntegrationService = new RatesIntegrationService();
