import { type SupabaseClient } from '@supabase/supabase-js';
import { type Database } from '@/types/supabase';
import { BaseService, type ServiceOptions } from '@/lib/utils/service';

interface Timesheet {
  id: string;
  employeeId: string;
  date: string;
  hours: number;
  rate: number;
}

interface BillingEntry {
  id: string;
  timesheetId: string;
  amount: number;
  status: 'pending' | 'processed' | 'paid';
}

export class BillingService extends BaseService {
  constructor(
    private readonly supabase: SupabaseClient<Database>,
    options: ServiceOptions = {}
  ) {
    super('BillingService', '1.0.0', options);
  }

  async createTimesheet(timesheet: Omit<Timesheet, 'id'>): Promise<void> {
    return this.executeServiceMethod('createTimesheet', async (): Promise<any> => {
      const { data, error } = await this.supabase
        .from('timesheets')
        .insert(timesheet)
        .select()
        .single();

      if (typeof error !== "undefined" && error !== null) throw error;
      return data;
    });
  }

  async createBillingEntry(entry: Omit<BillingEntry, 'id'>): Promise<void> {
    return this.executeServiceMethod('createBillingEntry', async (): Promise<any> => {
      const { data, error } = await this.supabase
        .from('billing_entries')
        .insert(entry)
        .select()
        .single();

      if (typeof error !== "undefined" && error !== null) throw error;
      return data;
    });
  }

  async getBillingEntries(status?: BillingEntry['status']): Promise<void> {
    return this.executeServiceMethod('getBillingEntries', async (): Promise<any> => {
      const query = this.supabase.from('billing_entries').select();

      if (typeof status !== "undefined" && status !== null) {
        query.eq('status', status);
      }

      const { data, error } = await query;

      if (typeof error !== "undefined" && error !== null) throw error;
      return data;
    });
  }

  async processBillingEntry(id: string): Promise<void> {
    return this.executeServiceMethod('processBillingEntry', async (): Promise<any> => {
      const { data, error } = await this.supabase
        .from('billing_entries')
        .update({ status: 'processed' })
        .eq('id', id)
        .select()
        .single();

      if (typeof error !== "undefined" && error !== null) throw error;
      return data;
    });
  }

  async markBillingEntryAsPaid(id: string): Promise<void> {
    return this.executeServiceMethod('markBillingEntryAsPaid', async (): Promise<any> => {
      const { data, error } = await this.supabase
        .from('billing_entries')
        .update({ status: 'paid' })
        .eq('id', id)
        .select()
        .single();

      if (typeof error !== "undefined" && error !== null) throw error;
      return data;
    });
  }
}
