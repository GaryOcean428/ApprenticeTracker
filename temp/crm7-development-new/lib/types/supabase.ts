export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      bank_accounts: {
        Row: {
          id: string;
          org_id: string;
          account_name: string;
          account_number: string;
          bsb: string;
          bank_name: string;
          is_active: boolean;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          account_name: string;
          account_number: string;
          bsb: string;
          bank_name: string;
          is_active?: boolean;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          account_name?: string;
          account_number?: string;
          bsb?: string;
          bank_name?: string;
          is_active?: boolean;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      bank_transactions: {
        Row: {
          id: string;
          org_id: string;
          account_id: string;
          transaction_type: 'credit' | 'debit';
          amount: number;
          description: string;
          reference: string | null;
          status: 'pending' | 'failed' | 'completed';
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          account_id: string;
          transaction_type: 'credit' | 'debit';
          amount: number;
          description: string;
          reference?: string | null;
          status?: 'pending' | 'failed' | 'completed';
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          account_id?: string;
          transaction_type?: 'credit' | 'debit';
          amount?: number;
          description?: string;
          reference?: string | null;
          status?: 'pending' | 'failed' | 'completed';
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      payment_requests: {
        Row: {
          id: string;
          org_id: string;
          account_id: string;
          amount: number;
          description: string;
          due_date: string;
          status: 'pending' | 'approved' | 'rejected' | 'completed';
          approver_id: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          account_id: string;
          amount: number;
          description: string;
          due_date: string;
          status?: 'pending' | 'approved' | 'rejected' | 'completed';
          approver_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          account_id?: string;
          amount?: number;
          description?: string;
          due_date?: string;
          status?: 'pending' | 'approved' | 'rejected' | 'completed';
          approver_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      rate_templates: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          description: string;
          base_rate: number;
          penalties: Json;
          allowances: Json;
          conditions: Json;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          description: string;
          base_rate: number;
          penalties: Json;
          allowances: Json;
          conditions: Json;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
          description?: string;
          base_rate?: number;
          penalties?: Json;
          allowances?: Json;
          conditions?: Json;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
