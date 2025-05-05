export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      rate_templates: {
        Row: {
          id: string;
          org_id: string;
          template_name: string;
          template_type: string;
          base_margin: number;
          super_rate: number;
          leave_loading?: number;
          workers_comp_rate: number;
          payroll_tax_rate: number;
          training_cost_rate?: number;
          other_costs_rate?: number;
          funding_offset?: number;
          effective_from: string;
          effective_to?: string;
          is_active: boolean;
          is_approved: boolean;
          version_number: number;
          rules: Json;
          metadata?: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          template_name: string;
          template_type: string;
          base_margin: number;
          super_rate: number;
          leave_loading?: number;
          workers_comp_rate: number;
          payroll_tax_rate: number;
          training_cost_rate?: number;
          other_costs_rate?: number;
          funding_offset?: number;
          effective_from: string;
          effective_to?: string;
          is_active?: boolean;
          is_approved?: boolean;
          version_number?: number;
          rules?: Json;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          template_name?: string;
          template_type?: string;
          base_margin?: number;
          super_rate?: number;
          leave_loading?: number;
          workers_comp_rate?: number;
          payroll_tax_rate?: number;
          training_cost_rate?: number;
          other_costs_rate?: number;
          funding_offset?: number;
          effective_from?: string;
          effective_to?: string;
          is_active?: boolean;
          is_approved?: boolean;
          version_number?: number;
          rules?: Json;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      bank_accounts: {
        Row: {
          id: string;
          org_id: string;
          account_name: string;
          account_number: string;
          bsb: string;
          bank_name: string;
          is_active: boolean;
          metadata?: Json;
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
          metadata?: Json;
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
          metadata?: Json;
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
          reference?: string;
          status: 'pending' | 'completed' | 'failed';
          metadata?: Json;
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
          reference?: string;
          status?: 'pending' | 'completed' | 'failed';
          metadata?: Json;
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
          reference?: string;
          status?: 'pending' | 'completed' | 'failed';
          metadata?: Json;
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
          approver_id?: string;
          metadata?: Json;
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
          approver_id?: string;
          metadata?: Json;
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
          approver_id?: string;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          org_id: string;
          title: string;
          description: string;
          duration: number;
          level: string;
          status: string;
          metadata?: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          title: string;
          description: string;
          duration: number;
          level: string;
          status?: string;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          title?: string;
          description?: string;
          duration?: number;
          level?: string;
          status?: string;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      enrollments: {
        Row: {
          id: string;
          org_id: string;
          course_id: string;
          user_id: string;
          status: string;
          progress: number;
          start_date: string;
          completion_date?: string;
          metadata?: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          course_id: string;
          user_id: string;
          status?: string;
          progress?: number;
          start_date: string;
          completion_date?: string;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          course_id?: string;
          user_id?: string;
          status?: string;
          progress?: number;
          start_date?: string;
          completion_date?: string;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      assessments: {
        Row: {
          id: string;
          org_id: string;
          course_id: string;
          title: string;
          description: string;
          type: string;
          duration: number;
          passing_grade: number;
          metadata?: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          course_id: string;
          title: string;
          description: string;
          type: string;
          duration: number;
          passing_grade: number;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          course_id?: string;
          title?: string;
          description?: string;
          type?: string;
          duration?: number;
          passing_grade?: number;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      units: {
        Row: {
          id: string;
          org_id: string;
          course_id: string;
          title: string;
          description: string;
          order: number;
          content: Json;
          metadata?: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          course_id: string;
          title: string;
          description: string;
          order: number;
          content: Json;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          course_id?: string;
          title?: string;
          description?: string;
          order?: number;
          content?: Json;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          org_id: string;
          user_id: string;
          amount: number;
          description: string;
          category: string;
          date: string;
          status: 'pending' | 'approved' | 'rejected';
          approver_id?: string;
          receipt_url?: string;
          metadata?: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          user_id: string;
          amount: number;
          description: string;
          category: string;
          date: string;
          status?: 'pending' | 'approved' | 'rejected';
          approver_id?: string;
          receipt_url?: string;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          user_id?: string;
          amount?: number;
          description?: string;
          category?: string;
          date?: string;
          status?: 'pending' | 'approved' | 'rejected';
          approver_id?: string;
          receipt_url?: string;
          metadata?: Json;
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
