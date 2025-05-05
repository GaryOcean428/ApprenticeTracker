import { type SupabaseClient } from '@supabase/supabase-js';
import { type Database } from '@/types/supabase';
import { BaseService, type ServiceOptions } from '@/lib/utils/service';

interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  rejectedBy?: string;
  rejectionReason?: string;
}

export class ExpenseService extends BaseService {
  constructor(
    private readonly supabase: SupabaseClient<Database>,
    options: ServiceOptions = {}
  ) {
    super('ExpenseService', '1.0.0', options);
  }

  async createExpense(expense: Omit<Expense, 'id' | 'status'>): Promise<void> {
    return this.executeServiceMethod('createExpense', async (): Promise<any> => {
      const { data, error } = await this.supabase
        .from('expenses')
        .insert({
          ...expense,
          status: 'pending',
        })
        .select()
        .single();

      if (typeof error !== "undefined" && error !== null) throw error;
      return data;
    });
  }

  async getExpense(id: string): Promise<void> {
    return this.executeServiceMethod('getExpense', async (): Promise<any> => {
      const { data, error } = await this.supabase
        .from('expenses')
        .select()
        .eq('id', id)
        .single();

      if (typeof error !== "undefined" && error !== null) throw error;
      return data;
    });
  }

  async updateExpense(id: string, updates: Partial<Expense>): Promise<void> {
    return this.executeServiceMethod('updateExpense', async (): Promise<any> => {
      const { data, error } = await this.supabase
        .from('expenses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (typeof error !== "undefined" && error !== null) throw error;
      return data;
    });
  }

  async approveExpense(id: string, approvedBy: string): Promise<void> {
    return this.updateExpense(id, {
      status: 'approved',
      approvedBy,
    });
  }

  async rejectExpense(id: string, rejectedBy: string, reason: string): Promise<void> {
    return this.updateExpense(id, {
      status: 'rejected',
      rejectedBy,
      rejectionReason: reason,
    });
  }

  async deleteExpense(id: string): Promise<void> {
    return this.executeServiceMethod('deleteExpense', async (): Promise<void> => {
      const { error } = await this.supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (typeof error !== "undefined" && error !== null) throw error;
    });
  }

  async getExpenses(status?: Expense['status']): Promise<void> {
    return this.executeServiceMethod('getExpenses', async (): Promise<any> => {
      const query = this.supabase.from('expenses').select();

      if (typeof status !== "undefined" && status !== null) {
        query.eq('status', status);
      }

      const { data, error } = await query;

      if (typeof error !== "undefined" && error !== null) throw error;
      return data;
    });
  }
}
