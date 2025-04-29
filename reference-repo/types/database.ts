export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          updated_at: string;
          full_name: string | null;
          avatar_url: string | null;
          organization_id: string | null;
          role: 'admin' | 'user' | null;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
          updated_at?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          organization_id?: string | null;
          role?: 'admin' | 'user' | null;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          organization_id?: string | null;
          role?: 'admin' | 'user' | null;
        };
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
          settings: Json | null;
          status: 'active' | 'inactive' | 'suspended';
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          updated_at?: string;
          settings?: Json | null;
          status?: 'active' | 'inactive' | 'suspended';
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
          settings?: Json | null;
          status?: 'active' | 'inactive' | 'suspended';
        };
      };
      rates: {
        Row: {
          id: string;
          organization_id: string;
          rate: number;
          effective_date: string;
          created_at: string;
          updated_at: string;
          status: 'active' | 'inactive' | 'pending';
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          rate: number;
          effective_date: string;
          created_at?: string;
          updated_at?: string;
          status?: 'active' | 'inactive' | 'pending';
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          organization_id?: string;
          rate?: number;
          effective_date?: string;
          created_at?: string;
          updated_at?: string;
          status?: 'active' | 'inactive' | 'pending';
          metadata?: Json | null;
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
