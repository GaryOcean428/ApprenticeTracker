import { type SupabaseClient } from '@supabase/supabase-js';
import { type Database } from '@/types/supabase-generated';

export class FundingService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async createClaim(data: {
    org_id: string;
    claim_number: string;
    amount: number;
    metadata: Record<string, unknown>;
  }) {
    const { data: claim, error } = await this.supabase
      .from('funding_claims')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return claim;
  }

  async uploadDocument(data: {
    fundingClaimId: string;
    documentType: string;
    file: File;
  }) {
    const { data: upload, error } = await this.supabase.storage
      .from('funding-documents')
      .upload(`${data.fundingClaimId}/${data.file.name}`, data.file);

    if (error) throw error;
    return upload;
  }
}
