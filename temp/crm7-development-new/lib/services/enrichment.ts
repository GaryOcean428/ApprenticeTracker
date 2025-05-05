import { type SupabaseClient } from '@supabase/supabase-js';
import { type Database } from '@/types/supabase';
import { BaseService, type ServiceOptions } from '@/lib/utils/service';

interface EnrichmentData {
  id: string;
  sourceId: string;
  enrichedData: Record<string, unknown>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export class EnrichmentService extends BaseService {
  constructor(
    private readonly supabase: SupabaseClient<Database>,
    options: ServiceOptions = {}
  ) {
    super('EnrichmentService', '1.0.0', options);
  }

  private async fetchExternalData(url: string): Promise<void> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    return response.json();
  }

  async enrichData(sourceId: string, urls: string[]): Promise<void> {
    return this.executeServiceMethod('enrichData', async () => {
      // Create initial record
      const { data, error } = await this.supabase
        .from('enrichment_data')
        .insert({
          sourceId,
          status: 'processing',
          enrichedData: {},
        })
        .select()
        .single();

      if (typeof error !== "undefined" && error !== null) throw error;

      try {
        // Fetch and combine data from all URLs
        const enrichedData = await Promise.all(
          urls.map(async (url) => {
            try {
              return await this.fetchExternalData(url);
            } catch (error) {
              console.error(`Failed to fetch data from ${url}:`, error);
              return null;
            }
          })
        );

        // Update with enriched data
        const { data: updatedData, error: updateError } = await this.supabase
          .from('enrichment_data')
          .update({
            enrichedData: enrichedData.filter(Boolean),
            status: 'completed',
          })
          .eq('id', data.id)
          .select()
          .single();

        if (typeof updateError !== "undefined" && updateError !== null) throw updateError;

        return updatedData;
      } catch (error) {
        // Update status to failed
        const { data: failedData, error: updateError } = await this.supabase
          .from('enrichment_data')
          .update({
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
          })
          .eq('id', data.id)
          .select()
          .single();

        if (typeof updateError !== "undefined" && updateError !== null) throw updateError;

        return failedData;
      }
    });
  }
}
