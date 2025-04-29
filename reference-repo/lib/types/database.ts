export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string;
          id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      agent_instances: {
        Row: {
          agent_type: Database['public']['Enums']['agent_type'];
          created_at: string | null;
          id: string;
          metadata: Json | null;
          name: string;
          status: string | null;
          updated_at: string | null;
        };
        Insert: {
          agent_type: Database['public']['Enums']['agent_type'];
          created_at?: string | null;
          id?: string;
          metadata?: Json | null;
          name: string;
          status?: string | null;
          updated_at?: string | null;
        };
        Update: {
          agent_type?: Database['public']['Enums']['agent_type'];
          created_at?: string | null;
          id?: string;
          metadata?: Json | null;
          name?: string;
          status?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      agent_memory: {
        Row: {
          agent_id: string | null;
          content: string;
          created_at: string | null;
          embedding: string | null;
          id: string;
          metadata: Json | null;
        };
        Insert: {
          agent_id?: string | null;
          content: string;
          created_at?: string | null;
          embedding?: string | null;
          id?: string;
          metadata?: Json | null;
        };
        Update: {
          agent_id?: string | null;
          content?: string;
          created_at?: string | null;
          embedding?: string | null;
          id?: string;
          metadata?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: 'agent_memory_agent_id_fkey';
            columns: ['agent_id'];
            isOneToOne: false;
            referencedRelation: 'agent_instances';
            referencedColumns: ['id'];
          },
        ];
      };
      allowance_rules: {
        Row: {
          allowance_amount: number | null;
          allowance_fixed_id: number | null;
          allowance_name: string;
          allowance_type: string | null;
          award_id: string | null;
          base_pay_rate_id: string | null;
          classification_id: string | null;
          clause_fixed_id: number | null;
          clauses: string | null;
          cpi_quarter_last_adjusted: string | null;
          created_at: string | null;
          id: string;
          is_all_purpose: boolean | null;
          last_adjusted_year: number | null;
          notes: string | null;
          operative_from: string | null;
          operative_to: string | null;
          parent_allowance: string | null;
          payment_frequency: string | null;
          published_year: number | null;
          rate: number | null;
          rate_unit: string | null;
          updated_at: string | null;
          version_number: number | null;
        };
        Insert: {
          allowance_amount?: number | null;
          allowance_fixed_id?: number | null;
          allowance_name: string;
          allowance_type?: string | null;
          award_id?: string | null;
          base_pay_rate_id?: string | null;
          classification_id?: string | null;
          clause_fixed_id?: number | null;
          clauses?: string | null;
          cpi_quarter_last_adjusted?: string | null;
          created_at?: string | null;
          id?: string;
          is_all_purpose?: boolean | null;
          last_adjusted_year?: number | null;
          notes?: string | null;
          operative_from?: string | null;
          operative_to?: string | null;
          parent_allowance?: string | null;
          payment_frequency?: string | null;
          published_year?: number | null;
          rate?: number | null;
          rate_unit?: string | null;
          updated_at?: string | null;
          version_number?: number | null;
        };
        Update: {
          allowance_amount?: number | null;
          allowance_fixed_id?: number | null;
          allowance_name?: string;
          allowance_type?: string | null;
          award_id?: string | null;
          base_pay_rate_id?: string | null;
          classification_id?: string | null;
          clause_fixed_id?: number | null;
          clauses?: string | null;
          cpi_quarter_last_adjusted?: string | null;
          created_at?: string | null;
          id?: string;
          is_all_purpose?: boolean | null;
          last_adjusted_year?: number | null;
          notes?: string | null;
          operative_from?: string | null;
          operative_to?: string | null;
          parent_allowance?: string | null;
          payment_frequency?: string | null;
          published_year?: number | null;
          rate?: number | null;
          rate_unit?: string | null;
          updated_at?: string | null;
          version_number?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'allowance_rules_award_id_fkey';
            columns: ['award_id'];
            isOneToOne: false;
            referencedRelation: 'awards';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'allowance_rules_classification_id_fkey';
            columns: ['classification_id'];
            isOneToOne: false;
            referencedRelation: 'award_classifications';
            referencedColumns: ['id'];
          },
        ];
      };
      app_leads: {
        Row: {
          created_at: string;
          email: string | null;
          id: string;
          name: string;
          org_id: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          id?: string;
          name: string;
          org_id: string;
          status: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          id?: string;
          name?: string;
          org_id?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_app_leads_org_id';
            columns: ['org_id'];
            isOneToOne: false;
            referencedRelation: 'app_organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      app_opportunities: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          org_id: string;
          status: string;
          updated_at: string;
          user_id: string | null;
          value: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          org_id: string;
          status: string;
          updated_at?: string;
          user_id?: string | null;
          value: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          org_id?: string;
          status?: string;
          updated_at?: string;
          user_id?: string | null;
          value?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_app_opportunities_org_id';
            columns: ['org_id'];
            isOneToOne: false;
            referencedRelation: 'app_organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      app_organizations: {
        Row: {
          created_at: string;
          id: string;
          is_gto: boolean | null;
          name: string;
          parent_org_id: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_gto?: boolean | null;
          name: string;
          parent_org_id?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_gto?: boolean | null;
          name?: string;
          parent_org_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_app_organizations_parent_org_id';
            columns: ['parent_org_id'];
            isOneToOne: false;
            referencedRelation: 'app_organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      apprentice_allowances: {
        Row: {
          apprentice_id: string | null;
          created_at: string | null;
          effective_from: string;
          effective_to: string | null;
          expense_allowance_id: string | null;
          id: string;
          updated_at: string | null;
          wage_allowance_id: string | null;
        };
        Insert: {
          apprentice_id?: string | null;
          created_at?: string | null;
          effective_from: string;
          effective_to?: string | null;
          expense_allowance_id?: string | null;
          id?: string;
          updated_at?: string | null;
          wage_allowance_id?: string | null;
        };
        Update: {
          apprentice_id?: string | null;
          created_at?: string | null;
          effective_from?: string;
          effective_to?: string | null;
          expense_allowance_id?: string | null;
          id?: string;
          updated_at?: string | null;
          wage_allowance_id?: string | null;
        };
        Relationships: [];
      };
      auth_settings: {
        Row: {
          created_at: string | null;
          id: string;
          mfa_enabled: boolean | null;
          mfa_verified: boolean | null;
          remember_me_expires: string | null;
          remember_me_token: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          mfa_enabled?: boolean | null;
          mfa_verified?: boolean | null;
          remember_me_expires?: string | null;
          remember_me_token?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          mfa_enabled?: boolean | null;
          mfa_verified?: boolean | null;
          remember_me_expires?: string | null;
          remember_me_token?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      award_classifications: {
        Row: {
          aqf_level: string | null;
          award_id: string | null;
          base_pay_rate_id: string | null;
          base_rate: number | null;
          base_rate_type: string | null;
          calculate_pay_rate_id: string | null;
          calculated_rate: number | null;
          calculated_rate_type: string | null;
          classification_fixed_id: number | null;
          classification_level: number | null;
          clause_description: string | null;
          clause_fixed_id: number | null;
          clauses: string | null;
          created_at: string | null;
          employee_rate_type_code: string | null;
          fair_work_level_code: string | null;
          fair_work_level_desc: string | null;
          id: string;
          name: string;
          next_down_classification_fixed_id: number | null;
          next_up_classification_fixed_id: number | null;
          operative_from: string | null;
          operative_to: string | null;
          parent_classification_name: string | null;
          published_year: number | null;
          updated_at: string | null;
          version_number: number | null;
        };
        Insert: {
          aqf_level?: string | null;
          award_id?: string | null;
          base_pay_rate_id?: string | null;
          base_rate?: number | null;
          base_rate_type?: string | null;
          calculate_pay_rate_id?: string | null;
          calculated_rate?: number | null;
          calculated_rate_type?: string | null;
          classification_fixed_id?: number | null;
          classification_level?: number | null;
          clause_description?: string | null;
          clause_fixed_id?: number | null;
          clauses?: string | null;
          created_at?: string | null;
          employee_rate_type_code?: string | null;
          fair_work_level_code?: string | null;
          fair_work_level_desc?: string | null;
          id?: string;
          name: string;
          next_down_classification_fixed_id?: number | null;
          next_up_classification_fixed_id?: number | null;
          operative_from?: string | null;
          operative_to?: string | null;
          parent_classification_name?: string | null;
          published_year?: number | null;
          updated_at?: string | null;
          version_number?: number | null;
        };
        Update: {
          aqf_level?: string | null;
          award_id?: string | null;
          base_pay_rate_id?: string | null;
          base_rate?: number | null;
          base_rate_type?: string | null;
          calculate_pay_rate_id?: string | null;
          calculated_rate?: number | null;
          calculated_rate_type?: string | null;
          classification_fixed_id?: number | null;
          classification_level?: number | null;
          clause_description?: string | null;
          clause_fixed_id?: number | null;
          clauses?: string | null;
          created_at?: string | null;
          employee_rate_type_code?: string | null;
          fair_work_level_code?: string | null;
          fair_work_level_desc?: string | null;
          id?: string;
          name?: string;
          next_down_classification_fixed_id?: number | null;
          next_up_classification_fixed_id?: number | null;
          operative_from?: string | null;
          operative_to?: string | null;
          parent_classification_name?: string | null;
          published_year?: number | null;
          updated_at?: string | null;
          version_number?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'award_classifications_award_id_fkey';
            columns: ['award_id'];
            isOneToOne: false;
            referencedRelation: 'awards';
            referencedColumns: ['id'];
          },
        ];
      };
      awards: {
        Row: {
          award_fixed_id: number | null;
          code: string | null;
          created_at: string | null;
          fair_work_reference: string | null;
          fair_work_title: string | null;
          id: string;
          name: string;
          published_year: number | null;
          ratescalc_code: string | null;
          updated_at: string | null;
          version_number: number | null;
        };
        Insert: {
          award_fixed_id?: number | null;
          code?: string | null;
          created_at?: string | null;
          fair_work_reference?: string | null;
          fair_work_title?: string | null;
          id?: string;
          name: string;
          published_year?: number | null;
          ratescalc_code?: string | null;
          updated_at?: string | null;
          version_number?: number | null;
        };
        Update: {
          award_fixed_id?: number | null;
          code?: string | null;
          created_at?: string | null;
          fair_work_reference?: string | null;
          fair_work_title?: string | null;
          id?: string;
          name?: string;
          published_year?: number | null;
          ratescalc_code?: string | null;
          updated_at?: string | null;
          version_number?: number | null;
        };
        Relationships: [];
      };
      billing_cycles: {
        Row: {
          created_at: string;
          end_date: string;
          host_org_id: string;
          id: string;
          invoice_date: string | null;
          invoice_number: string | null;
          start_date: string;
          status: string;
          total_amount: number;
          total_hours: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          end_date: string;
          host_org_id: string;
          id?: string;
          invoice_date?: string | null;
          invoice_number?: string | null;
          start_date: string;
          status: string;
          total_amount: number;
          total_hours: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          end_date?: string;
          host_org_id?: string;
          id?: string;
          invoice_date?: string | null;
          invoice_number?: string | null;
          start_date?: string;
          status?: string;
          total_amount?: number;
          total_hours?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      candidates: {
        Row: {
          created_at: string | null;
          email: string | null;
          first_name: string;
          id: string;
          last_name: string;
          phone: string | null;
          qualification_level: string | null;
          status: string | null;
          trade: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          email?: string | null;
          first_name: string;
          id?: string;
          last_name: string;
          phone?: string | null;
          qualification_level?: string | null;
          status?: string | null;
          trade?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string | null;
          first_name?: string;
          id?: string;
          last_name?: string;
          phone?: string | null;
          qualification_level?: string | null;
          status?: string | null;
          trade?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      challenges: {
        Row: {
          challenge_text: string;
          created_at: string;
          id: string;
          idea_id: string | null;
        };
        Insert: {
          challenge_text: string;
          created_at?: string;
          id?: string;
          idea_id?: string | null;
        };
        Update: {
          challenge_text?: string;
          created_at?: string;
          id?: string;
          idea_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'challenges_idea_id_fkey';
            columns: ['idea_id'];
            isOneToOne: false;
            referencedRelation: 'ideas';
            referencedColumns: ['id'];
          },
        ];
      };
      chat_messages: {
        Row: {
          content: string;
          created_at: string | null;
          embedding: string | null;
          id: string;
          is_ai: boolean | null;
          thread_id: string | null;
        };
        Insert: {
          content: string;
          created_at?: string | null;
          embedding?: string | null;
          id?: string;
          is_ai?: boolean | null;
          thread_id?: string | null;
        };
        Update: {
          content?: string;
          created_at?: string | null;
          embedding?: string | null;
          id?: string;
          is_ai?: boolean | null;
          thread_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'chat_messages_thread_id_fkey';
            columns: ['thread_id'];
            isOneToOne: false;
            referencedRelation: 'chat_threads';
            referencedColumns: ['id'];
          },
        ];
      };
      chat_threads: {
        Row: {
          created_at: string | null;
          id: string;
          is_saved: boolean | null;
          last_message_at: string | null;
          metadata: Json | null;
          name: string;
          org_id: string | null;
          team_id: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          is_saved?: boolean | null;
          last_message_at?: string | null;
          metadata?: Json | null;
          name: string;
          org_id?: string | null;
          team_id?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          is_saved?: boolean | null;
          last_message_at?: string | null;
          metadata?: Json | null;
          name?: string;
          org_id?: string | null;
          team_id?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'chat_threads_org_id_fkey';
            columns: ['org_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      clients: {
        Row: {
          created_at: string;
          email: string | null;
          enriched_data: Json | null;
          id: string;
          industry: string | null;
          last_enriched_at: string | null;
          name: string;
          phone: string | null;
          service_type: string | null;
          status: string | null;
          updated_at: string;
          website: string | null;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          enriched_data?: Json | null;
          id?: string;
          industry?: string | null;
          last_enriched_at?: string | null;
          name: string;
          phone?: string | null;
          service_type?: string | null;
          status?: string | null;
          updated_at?: string;
          website?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          enriched_data?: Json | null;
          id?: string;
          industry?: string | null;
          last_enriched_at?: string | null;
          name?: string;
          phone?: string | null;
          service_type?: string | null;
          status?: string | null;
          updated_at?: string;
          website?: string | null;
        };
        Relationships: [];
      };
      compliance_alerts: {
        Row: {
          created_at: string | null;
          description: string | null;
          due_date: string | null;
          id: string;
          related_entity_id: string | null;
          related_entity_type: string | null;
          severity: string;
          status: string | null;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          due_date?: string | null;
          id?: string;
          related_entity_id?: string | null;
          related_entity_type?: string | null;
          severity: string;
          status?: string | null;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          due_date?: string | null;
          id?: string;
          related_entity_id?: string | null;
          related_entity_type?: string | null;
          severity?: string;
          status?: string | null;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      contacts: {
        Row: {
          company: string | null;
          created_at: string;
          email: string | null;
          first_name: string | null;
          id: string;
          last_name: string | null;
          owner_id: string | null;
          phone: string | null;
          status: string | null;
          title: string | null;
          updated_at: string;
        };
        Insert: {
          company?: string | null;
          created_at?: string;
          email?: string | null;
          first_name?: string | null;
          id?: string;
          last_name?: string | null;
          owner_id?: string | null;
          phone?: string | null;
          status?: string | null;
          title?: string | null;
          updated_at?: string;
        };
        Update: {
          company?: string | null;
          created_at?: string;
          email?: string | null;
          first_name?: string | null;
          id?: string;
          last_name?: string | null;
          owner_id?: string | null;
          phone?: string | null;
          status?: string | null;
          title?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      content_blocks: {
        Row: {
          content: Json;
          created_at: string;
          created_by: string | null;
          id: string;
          name: string;
          type: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          content?: Json;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          name: string;
          type: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          content?: Json;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          name?: string;
          type?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      content_pages: {
        Row: {
          content: Json;
          created_at: string;
          created_by: string | null;
          id: string;
          is_published: boolean | null;
          meta_description: string | null;
          slug: string;
          title: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          content?: Json;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          is_published?: boolean | null;
          meta_description?: string | null;
          slug: string;
          title: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          content?: Json;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          is_published?: boolean | null;
          meta_description?: string | null;
          slug?: string;
          title?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      dev_users: {
        Row: {
          created_at: string;
          id: string;
          nominated_by: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          nominated_by?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          nominated_by?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      document_operations: {
        Row: {
          created_at: string | null;
          document_id: number | null;
          id: string;
          operation: Json;
          user_id: string | null;
          version: number;
        };
        Insert: {
          created_at?: string | null;
          document_id?: number | null;
          id?: string;
          operation: Json;
          user_id?: string | null;
          version: number;
        };
        Update: {
          created_at?: string | null;
          document_id?: number | null;
          id?: string;
          operation?: Json;
          user_id?: string | null;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'document_operations_document_id_fkey';
            columns: ['document_id'];
            isOneToOne: false;
            referencedRelation: 'documents';
            referencedColumns: ['id'];
          },
        ];
      };
      documents: {
        Row: {
          collaborative: boolean | null;
          content: string | null;
          embedding: string | null;
          id: number;
          last_modified: string | null;
          metadata: Json | null;
          org_id: string | null;
          team_id: string | null;
          user_id: string | null;
          version: number;
        };
        Insert: {
          collaborative?: boolean | null;
          content?: string | null;
          embedding?: string | null;
          id?: number;
          last_modified?: string | null;
          metadata?: Json | null;
          org_id?: string | null;
          team_id?: string | null;
          user_id?: string | null;
          version?: number;
        };
        Update: {
          collaborative?: boolean | null;
          content?: string | null;
          embedding?: string | null;
          id?: number;
          last_modified?: string | null;
          metadata?: Json | null;
          org_id?: string | null;
          team_id?: string | null;
          user_id?: string | null;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'documents_org_id_fkey';
            columns: ['org_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      employees: {
        Row: {
          apprenticeship_year: number | null;
          created_at: string | null;
          first_name: string;
          gto_enrolled: boolean | null;
          id: string;
          last_name: string;
          training_contract_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          apprenticeship_year?: number | null;
          created_at?: string | null;
          first_name: string;
          gto_enrolled?: boolean | null;
          id?: string;
          last_name: string;
          training_contract_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          apprenticeship_year?: number | null;
          created_at?: string | null;
          first_name?: string;
          gto_enrolled?: boolean | null;
          id?: string;
          last_name?: string;
          training_contract_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      enterprise_agreements: {
        Row: {
          agreement_code: string | null;
          agreement_name: string;
          agreement_status: string | null;
          created_at: string | null;
          description: string | null;
          effective_date: string | null;
          expiry_date: string | null;
          id: string;
          notes: string | null;
          updated_at: string | null;
        };
        Insert: {
          agreement_code?: string | null;
          agreement_name: string;
          agreement_status?: string | null;
          created_at?: string | null;
          description?: string | null;
          effective_date?: string | null;
          expiry_date?: string | null;
          id?: string;
          notes?: string | null;
          updated_at?: string | null;
        };
        Update: {
          agreement_code?: string | null;
          agreement_name?: string;
          agreement_status?: string | null;
          created_at?: string | null;
          description?: string | null;
          effective_date?: string | null;
          expiry_date?: string | null;
          id?: string;
          notes?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      external_portals: {
        Row: {
          api_key: string | null;
          base_url: string | null;
          configuration: Json | null;
          created_at: string | null;
          id: string;
          is_active: boolean | null;
          org_id: string;
          portal_name: string;
          portal_type: string | null;
          updated_at: string | null;
        };
        Insert: {
          api_key?: string | null;
          base_url?: string | null;
          configuration?: Json | null;
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          org_id: string;
          portal_name: string;
          portal_type?: string | null;
          updated_at?: string | null;
        };
        Update: {
          api_key?: string | null;
          base_url?: string | null;
          configuration?: Json | null;
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          org_id?: string;
          portal_name?: string;
          portal_type?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'external_portals_org_id_fkey';
            columns: ['org_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      fairwork_compliance_log: {
        Row: {
          compliance_check: string | null;
          created_at: string | null;
          employee_id: string;
          id: string;
          notes: string | null;
          outcome: string | null;
          pay_rate_id: string | null;
        };
        Insert: {
          compliance_check?: string | null;
          created_at?: string | null;
          employee_id: string;
          id?: string;
          notes?: string | null;
          outcome?: string | null;
          pay_rate_id?: string | null;
        };
        Update: {
          compliance_check?: string | null;
          created_at?: string | null;
          employee_id?: string;
          id?: string;
          notes?: string | null;
          outcome?: string | null;
          pay_rate_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'fairwork_compliance_log_employee_id_fkey';
            columns: ['employee_id'];
            isOneToOne: false;
            referencedRelation: 'employees';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fairwork_compliance_log_pay_rate_id_fkey';
            columns: ['pay_rate_id'];
            isOneToOne: false;
            referencedRelation: 'pay_rates';
            referencedColumns: ['id'];
          },
        ];
      };
      flow_executions: {
        Row: {
          completed_at: string | null;
          error: string | null;
          flow_id: string | null;
          id: string;
          result: Json | null;
          started_at: string | null;
          status: string;
          trigger_data: Json | null;
        };
        Insert: {
          completed_at?: string | null;
          error?: string | null;
          flow_id?: string | null;
          id?: string;
          result?: Json | null;
          started_at?: string | null;
          status?: string;
          trigger_data?: Json | null;
        };
        Update: {
          completed_at?: string | null;
          error?: string | null;
          flow_id?: string | null;
          id?: string;
          result?: Json | null;
          started_at?: string | null;
          status?: string;
          trigger_data?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: 'flow_executions_flow_id_fkey';
            columns: ['flow_id'];
            isOneToOne: false;
            referencedRelation: 'flows';
            referencedColumns: ['id'];
          },
        ];
      };
      flows: {
        Row: {
          created_at: string;
          edges: Json;
          id: string;
          is_trigger_flow: boolean | null;
          name: string;
          nodes: Json;
          trigger_config: Json | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          edges?: Json;
          id?: string;
          is_trigger_flow?: boolean | null;
          name: string;
          nodes?: Json;
          trigger_config?: Json | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          edges?: Json;
          id?: string;
          is_trigger_flow?: boolean | null;
          name?: string;
          nodes?: Json;
          trigger_config?: Json | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      ideas: {
        Row: {
          category: string;
          created_at: string;
          description: string;
          id: string;
          project_id: string | null;
          status: string;
          tags: string[] | null;
          title: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          category: string;
          created_at?: string;
          description: string;
          id?: string;
          project_id?: string | null;
          status?: string;
          tags?: string[] | null;
          title: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          category?: string;
          created_at?: string;
          description?: string;
          id?: string;
          project_id?: string | null;
          status?: string;
          tags?: string[] | null;
          title?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'ideas_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
        ];
      };
      industry_analytics: {
        Row: {
          analysis_date: string | null;
          confidence_score: number | null;
          created_at: string | null;
          id: string;
          idea_id: string | null;
          industry_name: string;
          metadata: Json | null;
          metric_name: string;
          metric_value: number | null;
          source: string | null;
          trend_direction: string | null;
          updated_at: string | null;
        };
        Insert: {
          analysis_date?: string | null;
          confidence_score?: number | null;
          created_at?: string | null;
          id?: string;
          idea_id?: string | null;
          industry_name: string;
          metadata?: Json | null;
          metric_name: string;
          metric_value?: number | null;
          source?: string | null;
          trend_direction?: string | null;
          updated_at?: string | null;
        };
        Update: {
          analysis_date?: string | null;
          confidence_score?: number | null;
          created_at?: string | null;
          id?: string;
          idea_id?: string | null;
          industry_name?: string;
          metadata?: Json | null;
          metric_name?: string;
          metric_value?: number | null;
          source?: string | null;
          trend_direction?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'industry_analytics_idea_id_fkey';
            columns: ['idea_id'];
            isOneToOne: false;
            referencedRelation: 'ideas';
            referencedColumns: ['id'];
          },
        ];
      };
      jobs: {
        Row: {
          created_at: string | null;
          id: string;
          labour_hire_indicator: boolean | null;
          organization_id: string | null;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          labour_hire_indicator?: boolean | null;
          organization_id?: string | null;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          labour_hire_indicator?: boolean | null;
          organization_id?: string | null;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'jobs_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      knowledge_sources: {
        Row: {
          content: string | null;
          created_at: string;
          embedding: string | null;
          id: number;
          metadata: Json | null;
          org_id: string | null;
          source_type: string;
          source_url: string | null;
          team_id: string | null;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          content?: string | null;
          created_at?: string;
          embedding?: string | null;
          id?: number;
          metadata?: Json | null;
          org_id?: string | null;
          source_type: string;
          source_url?: string | null;
          team_id?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          content?: string | null;
          created_at?: string;
          embedding?: string | null;
          id?: number;
          metadata?: Json | null;
          org_id?: string | null;
          source_type?: string;
          source_url?: string | null;
          team_id?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'knowledge_sources_org_id_fkey';
            columns: ['org_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      leads: {
        Row: {
          company: string | null;
          converted_to_account_id: string | null;
          converted_to_opportunity_id: string | null;
          created_at: string | null;
          email: string | null;
          id: string;
          last_activity: string | null;
          name: string;
          owner_id: string | null;
          phone: string | null;
          score: number | null;
          service_type: string | null;
          status: string | null;
          value: number | null;
        };
        Insert: {
          company?: string | null;
          converted_to_account_id?: string | null;
          converted_to_opportunity_id?: string | null;
          created_at?: string | null;
          email?: string | null;
          id?: string;
          last_activity?: string | null;
          name: string;
          owner_id?: string | null;
          phone?: string | null;
          score?: number | null;
          service_type?: string | null;
          status?: string | null;
          value?: number | null;
        };
        Update: {
          company?: string | null;
          converted_to_account_id?: string | null;
          converted_to_opportunity_id?: string | null;
          created_at?: string | null;
          email?: string | null;
          id?: string;
          last_activity?: string | null;
          name?: string;
          owner_id?: string | null;
          phone?: string | null;
          score?: number | null;
          service_type?: string | null;
          status?: string | null;
          value?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_converted_account';
            columns: ['converted_to_account_id'];
            isOneToOne: false;
            referencedRelation: 'clients';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_converted_opportunity';
            columns: ['converted_to_opportunity_id'];
            isOneToOne: false;
            referencedRelation: 'opportunities';
            referencedColumns: ['id'];
          },
        ];
      };
      media: {
        Row: {
          created_at: string;
          created_by: string | null;
          description: string | null;
          file_path: string;
          file_type: string;
          id: string;
          metadata: Json | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          file_path: string;
          file_type: string;
          id?: string;
          metadata?: Json | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          file_path?: string;
          file_type?: string;
          id?: string;
          metadata?: Json | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      navigation_history: {
        Row: {
          agent_id: string | null;
          content: string | null;
          embedding: string | null;
          id: string;
          metadata: Json | null;
          title: string | null;
          url: string;
          visited_at: string | null;
        };
        Insert: {
          agent_id?: string | null;
          content?: string | null;
          embedding?: string | null;
          id?: string;
          metadata?: Json | null;
          title?: string | null;
          url: string;
          visited_at?: string | null;
        };
        Update: {
          agent_id?: string | null;
          content?: string | null;
          embedding?: string | null;
          id?: string;
          metadata?: Json | null;
          title?: string | null;
          url?: string;
          visited_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'navigation_history_agent_id_fkey';
            columns: ['agent_id'];
            isOneToOne: false;
            referencedRelation: 'agent_instances';
            referencedColumns: ['id'];
          },
        ];
      };
      nods_page: {
        Row: {
          checksum: string | null;
          id: number;
          meta: Json | null;
          parent_page_id: number | null;
          path: string;
          source: string | null;
          type: string | null;
        };
        Insert: {
          checksum?: string | null;
          id?: number;
          meta?: Json | null;
          parent_page_id?: number | null;
          path: string;
          source?: string | null;
          type?: string | null;
        };
        Update: {
          checksum?: string | null;
          id?: number;
          meta?: Json | null;
          parent_page_id?: number | null;
          path?: string;
          source?: string | null;
          type?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'nods_page_parent_page_id_fkey';
            columns: ['parent_page_id'];
            isOneToOne: false;
            referencedRelation: 'nods_page';
            referencedColumns: ['id'];
          },
        ];
      };
      nods_page_section: {
        Row: {
          content: string | null;
          embedding: string | null;
          heading: string | null;
          id: number;
          page_id: number;
          slug: string | null;
          token_count: number | null;
          user_id: string | null;
        };
        Insert: {
          content?: string | null;
          embedding?: string | null;
          heading?: string | null;
          id?: number;
          page_id: number;
          slug?: string | null;
          token_count?: number | null;
          user_id?: string | null;
        };
        Update: {
          content?: string | null;
          embedding?: string | null;
          heading?: string | null;
          id?: number;
          page_id?: number;
          slug?: string | null;
          token_count?: number | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'nods_page_section_page_id_fkey';
            columns: ['page_id'];
            isOneToOne: false;
            referencedRelation: 'nods_page';
            referencedColumns: ['id'];
          },
        ];
      };
      opportunities: {
        Row: {
          account_id: string | null;
          contact_id: string | null;
          created_at: string;
          currency: string | null;
          description: string | null;
          expected_close_date: string;
          id: string;
          last_activity_date: string | null;
          lead_id: string | null;
          name: string;
          owner_id: string | null;
          pipeline: string | null;
          probability: number;
          source: string | null;
          stage: string;
          status: string | null;
          tags: string[] | null;
          updated_at: string;
          value: number;
        };
        Insert: {
          account_id?: string | null;
          contact_id?: string | null;
          created_at?: string;
          currency?: string | null;
          description?: string | null;
          expected_close_date: string;
          id?: string;
          last_activity_date?: string | null;
          lead_id?: string | null;
          name: string;
          owner_id?: string | null;
          pipeline?: string | null;
          probability: number;
          source?: string | null;
          stage: string;
          status?: string | null;
          tags?: string[] | null;
          updated_at?: string;
          value: number;
        };
        Update: {
          account_id?: string | null;
          contact_id?: string | null;
          created_at?: string;
          currency?: string | null;
          description?: string | null;
          expected_close_date?: string;
          id?: string;
          last_activity_date?: string | null;
          lead_id?: string | null;
          name?: string;
          owner_id?: string | null;
          pipeline?: string | null;
          probability?: number;
          source?: string | null;
          stage?: string;
          status?: string | null;
          tags?: string[] | null;
          updated_at?: string;
          value?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'opportunities_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'clients';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'opportunities_contact_id_fkey';
            columns: ['contact_id'];
            isOneToOne: false;
            referencedRelation: 'contacts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'opportunities_lead_id_fkey';
            columns: ['lead_id'];
            isOneToOne: false;
            referencedRelation: 'leads';
            referencedColumns: ['id'];
          },
        ];
      };
      opportunity_activities: {
        Row: {
          activity_type: string;
          created_at: string;
          description: string | null;
          id: string;
          opportunity_id: string | null;
          user_id: string | null;
        };
        Insert: {
          activity_type: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          opportunity_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          activity_type?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          opportunity_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'opportunity_activities_opportunity_id_fkey';
            columns: ['opportunity_id'];
            isOneToOne: false;
            referencedRelation: 'opportunities';
            referencedColumns: ['id'];
          },
        ];
      };
      opportunity_attachments: {
        Row: {
          created_at: string;
          file_name: string;
          file_size: number;
          file_type: string;
          id: string;
          opportunity_id: string | null;
          storage_path: string;
          uploaded_by: string | null;
        };
        Insert: {
          created_at?: string;
          file_name: string;
          file_size: number;
          file_type: string;
          id?: string;
          opportunity_id?: string | null;
          storage_path: string;
          uploaded_by?: string | null;
        };
        Update: {
          created_at?: string;
          file_name?: string;
          file_size?: number;
          file_type?: string;
          id?: string;
          opportunity_id?: string | null;
          storage_path?: string;
          uploaded_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'opportunity_attachments_opportunity_id_fkey';
            columns: ['opportunity_id'];
            isOneToOne: false;
            referencedRelation: 'opportunities';
            referencedColumns: ['id'];
          },
        ];
      };
      organizations: {
        Row: {
          created_at: string | null;
          id: string;
          is_gto: boolean | null;
          labour_hire_licence_no: string | null;
          name: string;
          owner_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          is_gto?: boolean | null;
          labour_hire_licence_no?: string | null;
          name: string;
          owner_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          is_gto?: boolean | null;
          labour_hire_licence_no?: string | null;
          name?: string;
          owner_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'organizations_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      pay_rates: {
        Row: {
          classification_id: string | null;
          created_at: string | null;
          hourly_rate: number;
          id: string;
          is_apprentice_rate: boolean | null;
          updated_at: string | null;
        };
        Insert: {
          classification_id?: string | null;
          created_at?: string | null;
          hourly_rate: number;
          id?: string;
          is_apprentice_rate?: boolean | null;
          updated_at?: string | null;
        };
        Update: {
          classification_id?: string | null;
          created_at?: string | null;
          hourly_rate?: number;
          id?: string;
          is_apprentice_rate?: boolean | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'pay_rates_classification_id_fkey';
            columns: ['classification_id'];
            isOneToOne: false;
            referencedRelation: 'award_classifications';
            referencedColumns: ['id'];
          },
        ];
      };
      penalty_rules: {
        Row: {
          award_id: string | null;
          base_pay_rate_id: string | null;
          classification_id: string | null;
          classification_level: number | null;
          clause_description: string | null;
          clause_fixed_id: number | null;
          created_at: string | null;
          day_of_week: number[] | null;
          employee_rate_type_code: string | null;
          end_time: string | null;
          id: string;
          multiplier: number | null;
          notes: string | null;
          operative_from: string | null;
          operative_to: string | null;
          penalty_calculated_value: number | null;
          penalty_description: string | null;
          penalty_fixed_id: number | null;
          penalty_name: string;
          penalty_type: string | null;
          published_year: number | null;
          rate: number | null;
          start_time: string | null;
          updated_at: string | null;
          version_number: number | null;
        };
        Insert: {
          award_id?: string | null;
          base_pay_rate_id?: string | null;
          classification_id?: string | null;
          classification_level?: number | null;
          clause_description?: string | null;
          clause_fixed_id?: number | null;
          created_at?: string | null;
          day_of_week?: number[] | null;
          employee_rate_type_code?: string | null;
          end_time?: string | null;
          id?: string;
          multiplier?: number | null;
          notes?: string | null;
          operative_from?: string | null;
          operative_to?: string | null;
          penalty_calculated_value?: number | null;
          penalty_description?: string | null;
          penalty_fixed_id?: number | null;
          penalty_name: string;
          penalty_type?: string | null;
          published_year?: number | null;
          rate?: number | null;
          start_time?: string | null;
          updated_at?: string | null;
          version_number?: number | null;
        };
        Update: {
          award_id?: string | null;
          base_pay_rate_id?: string | null;
          classification_id?: string | null;
          classification_level?: number | null;
          clause_description?: string | null;
          clause_fixed_id?: number | null;
          created_at?: string | null;
          day_of_week?: number[] | null;
          employee_rate_type_code?: string | null;
          end_time?: string | null;
          id?: string;
          multiplier?: number | null;
          notes?: string | null;
          operative_from?: string | null;
          operative_to?: string | null;
          penalty_calculated_value?: number | null;
          penalty_description?: string | null;
          penalty_fixed_id?: number | null;
          penalty_name?: string;
          penalty_type?: string | null;
          published_year?: number | null;
          rate?: number | null;
          start_time?: string | null;
          updated_at?: string | null;
          version_number?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'penalty_rules_award_id_fkey';
            columns: ['award_id'];
            isOneToOne: false;
            referencedRelation: 'awards';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'penalty_rules_classification_id_fkey';
            columns: ['classification_id'];
            isOneToOne: false;
            referencedRelation: 'award_classifications';
            referencedColumns: ['id'];
          },
        ];
      };
      placements: {
        Row: {
          created_at: string | null;
          employee_id: string | null;
          gto_placement: boolean | null;
          id: string;
          job_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          employee_id?: string | null;
          gto_placement?: boolean | null;
          id?: string;
          job_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          employee_id?: string | null;
          gto_placement?: boolean | null;
          id?: string;
          job_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'placements_employee_id_fkey';
            columns: ['employee_id'];
            isOneToOne: false;
            referencedRelation: 'employees';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'placements_job_id_fkey';
            columns: ['job_id'];
            isOneToOne: false;
            referencedRelation: 'jobs';
            referencedColumns: ['id'];
          },
        ];
      };
      plugins: {
        Row: {
          config: Json | null;
          created_at: string | null;
          description: string | null;
          entry_point: string;
          id: string;
          is_enabled: boolean | null;
          name: string;
          updated_at: string | null;
          version: string | null;
        };
        Insert: {
          config?: Json | null;
          created_at?: string | null;
          description?: string | null;
          entry_point: string;
          id?: string;
          is_enabled?: boolean | null;
          name: string;
          updated_at?: string | null;
          version?: string | null;
        };
        Update: {
          config?: Json | null;
          created_at?: string | null;
          description?: string | null;
          entry_point?: string;
          id?: string;
          is_enabled?: boolean | null;
          name?: string;
          updated_at?: string | null;
          version?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          first_name: string | null;
          id: string;
          last_name: string | null;
          updated_at: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string | null;
          first_name?: string | null;
          id: string;
          last_name?: string | null;
          updated_at?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string | null;
          first_name?: string | null;
          id?: string;
          last_name?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          name: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'projects_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      public_holidays: {
        Row: {
          created_at: string | null;
          holiday_date: string;
          holiday_name: string;
          id: string;
          notes: string | null;
          state: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          holiday_date: string;
          holiday_name: string;
          id?: string;
          notes?: string | null;
          state: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          holiday_date?: string;
          holiday_name?: string;
          id?: string;
          notes?: string | null;
          state?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      rate_adjustments: {
        Row: {
          adjustment_type: string;
          amount: number;
          created_at: string;
          effective_from: string;
          effective_to: string | null;
          host_org_id: string;
          id: string;
          percentage: number | null;
          reason: string;
          updated_at: string;
          worker_id: string;
        };
        Insert: {
          adjustment_type: string;
          amount: number;
          created_at?: string;
          effective_from: string;
          effective_to?: string | null;
          host_org_id: string;
          id?: string;
          percentage?: number | null;
          reason: string;
          updated_at?: string;
          worker_id: string;
        };
        Update: {
          adjustment_type?: string;
          amount?: number;
          created_at?: string;
          effective_from?: string;
          effective_to?: string | null;
          host_org_id?: string;
          id?: string;
          percentage?: number | null;
          reason?: string;
          updated_at?: string;
          worker_id?: string;
        };
        Relationships: [];
      };
      rate_base_values: {
        Row: {
          category: string;
          created_at: string;
          id: string;
          template_id: string;
          unit: string;
          updated_at: string;
          value: number;
        };
        Insert: {
          category: string;
          created_at?: string;
          id?: string;
          template_id: string;
          unit: string;
          updated_at?: string;
          value: number;
        };
        Update: {
          category?: string;
          created_at?: string;
          id?: string;
          template_id?: string;
          unit?: string;
          updated_at?: string;
          value?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'rate_base_values_template_id_fkey';
            columns: ['template_id'];
            isOneToOne: false;
            referencedRelation: 'rate_templates';
            referencedColumns: ['id'];
          },
        ];
      };
      rate_calculations: {
        Row: {
          admin_cost: number;
          annual_leave_cost: number;
          annual_leave_days: number;
          annual_leave_loading_cost: number;
          annual_leave_loading_percent: number;
          base_rate: number;
          billing_model: string;
          charge_rate: number;
          created_at: string;
          effective_date: string;
          financing_cost: number;
          fixed_costs: number;
          gross_profit: number;
          host_org_id: string;
          hours_per_year: number;
          id: string;
          margin_percent: number;
          markup_percent: number;
          other_costs: number;
          payroll_tax_cost: number;
          payroll_tax_percent: number;
          protective_equipment_annual: number;
          protective_equipment_hourly: number;
          public_holidays_cost: number;
          public_holidays_days: number;
          sick_leave_cost: number;
          sick_leave_days: number;
          study_costs_annual: number;
          study_costs_hourly: number;
          superannuation_cost: number;
          superannuation_percent: number;
          template_id: string;
          total_cost: number;
          training_cost: number;
          training_weeks: number;
          updated_at: string;
          worker_id: string;
          workers_comp_cost: number;
          workers_comp_percent: number;
        };
        Insert: {
          admin_cost?: number;
          annual_leave_cost: number;
          annual_leave_days?: number;
          annual_leave_loading_cost: number;
          annual_leave_loading_percent?: number;
          base_rate: number;
          billing_model?: string;
          charge_rate: number;
          created_at?: string;
          effective_date: string;
          financing_cost?: number;
          fixed_costs?: number;
          gross_profit: number;
          host_org_id: string;
          hours_per_year?: number;
          id?: string;
          margin_percent: number;
          markup_percent: number;
          other_costs?: number;
          payroll_tax_cost: number;
          payroll_tax_percent?: number;
          protective_equipment_annual?: number;
          protective_equipment_hourly: number;
          public_holidays_cost: number;
          public_holidays_days?: number;
          sick_leave_cost: number;
          sick_leave_days?: number;
          study_costs_annual?: number;
          study_costs_hourly: number;
          superannuation_cost: number;
          superannuation_percent?: number;
          template_id: string;
          total_cost: number;
          training_cost: number;
          training_weeks?: number;
          updated_at?: string;
          worker_id: string;
          workers_comp_cost: number;
          workers_comp_percent?: number;
        };
        Update: {
          admin_cost?: number;
          annual_leave_cost?: number;
          annual_leave_days?: number;
          annual_leave_loading_cost?: number;
          annual_leave_loading_percent?: number;
          base_rate?: number;
          billing_model?: string;
          charge_rate?: number;
          created_at?: string;
          effective_date?: string;
          financing_cost?: number;
          fixed_costs?: number;
          gross_profit?: number;
          host_org_id?: string;
          hours_per_year?: number;
          id?: string;
          margin_percent?: number;
          markup_percent?: number;
          other_costs?: number;
          payroll_tax_cost?: number;
          payroll_tax_percent?: number;
          protective_equipment_annual?: number;
          protective_equipment_hourly?: number;
          public_holidays_cost?: number;
          public_holidays_days?: number;
          sick_leave_cost?: number;
          sick_leave_days?: number;
          study_costs_annual?: number;
          study_costs_hourly?: number;
          superannuation_cost?: number;
          superannuation_percent?: number;
          template_id?: string;
          total_cost?: number;
          training_cost?: number;
          training_weeks?: number;
          updated_at?: string;
          worker_id?: string;
          workers_comp_cost?: number;
          workers_comp_percent?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'rate_calculations_template_id_fkey';
            columns: ['template_id'];
            isOneToOne: false;
            referencedRelation: 'rate_templates';
            referencedColumns: ['id'];
          },
        ];
      };
      rate_templates: {
        Row: {
          award_code: string;
          classification: string;
          created_at: string;
          description: string | null;
          effective_from: string;
          effective_to: string | null;
          id: string;
          is_active: boolean;
          name: string;
          org_id: string;
          updated_at: string;
        };
        Insert: {
          award_code: string;
          classification: string;
          created_at?: string;
          description?: string | null;
          effective_from: string;
          effective_to?: string | null;
          id?: string;
          is_active?: boolean;
          name: string;
          org_id: string;
          updated_at?: string;
        };
        Update: {
          award_code?: string;
          classification?: string;
          created_at?: string;
          description?: string | null;
          effective_from?: string;
          effective_to?: string | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          org_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      response_metrics: {
        Row: {
          created_at: string | null;
          error_message: string | null;
          error_occurred: boolean | null;
          feedback_score: number | null;
          id: string;
          is_code_related: boolean;
          message_id: string;
          model: string;
          parameters: Json;
          response_time: number;
          token_count: number | null;
        };
        Insert: {
          created_at?: string | null;
          error_message?: string | null;
          error_occurred?: boolean | null;
          feedback_score?: number | null;
          id?: string;
          is_code_related: boolean;
          message_id: string;
          model: string;
          parameters: Json;
          response_time: number;
          token_count?: number | null;
        };
        Update: {
          created_at?: string | null;
          error_message?: string | null;
          error_occurred?: boolean | null;
          feedback_score?: number | null;
          id?: string;
          is_code_related?: boolean;
          message_id?: string;
          model?: string;
          parameters?: Json;
          response_time?: number;
          token_count?: number | null;
        };
        Relationships: [];
      };
      saved_searches: {
        Row: {
          created_at: string;
          id: number;
          metadata: Json | null;
          name: string;
          org_id: string | null;
          query: string;
          team_id: string | null;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          metadata?: Json | null;
          name: string;
          org_id?: string | null;
          query: string;
          team_id?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          metadata?: Json | null;
          name?: string;
          org_id?: string | null;
          query?: string;
          team_id?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'saved_searches_org_id_fkey';
            columns: ['org_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      scraping_configs: {
        Row: {
          created_at: string | null;
          extract_rules: Json | null;
          id: string;
          max_depth: number | null;
          name: string;
          updated_at: string | null;
          url_patterns: string[];
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          extract_rules?: Json | null;
          id?: string;
          max_depth?: number | null;
          name: string;
          updated_at?: string | null;
          url_patterns: string[];
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          extract_rules?: Json | null;
          id?: string;
          max_depth?: number | null;
          name?: string;
          updated_at?: string | null;
          url_patterns?: string[];
          user_id?: string | null;
        };
        Relationships: [];
      };
      secrets: {
        Row: {
          created_at: string | null;
          id: string;
          name: string;
          updated_at: string | null;
          user_id: string;
          value: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          name: string;
          updated_at?: string | null;
          user_id: string;
          value: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          name?: string;
          updated_at?: string | null;
          user_id?: string;
          value?: string;
        };
        Relationships: [];
      };
      sections: {
        Row: {
          content: Json;
          created_at: string;
          id: string;
          idea_id: string | null;
          type: string;
          updated_at: string;
        };
        Insert: {
          content?: Json;
          created_at?: string;
          id?: string;
          idea_id?: string | null;
          type: string;
          updated_at?: string;
        };
        Update: {
          content?: Json;
          created_at?: string;
          id?: string;
          idea_id?: string | null;
          type?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'sections_idea_id_fkey';
            columns: ['idea_id'];
            isOneToOne: false;
            referencedRelation: 'ideas';
            referencedColumns: ['id'];
          },
        ];
      };
      task_plans: {
        Row: {
          created_at: string | null;
          id: string;
          planned_steps: Json;
          result: Json | null;
          status: string | null;
          task_description: string;
          thread_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          planned_steps: Json;
          result?: Json | null;
          status?: string | null;
          task_description: string;
          thread_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          planned_steps?: Json;
          result?: Json | null;
          status?: string | null;
          task_description?: string;
          thread_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'task_plans_thread_id_fkey';
            columns: ['thread_id'];
            isOneToOne: false;
            referencedRelation: 'chat_threads';
            referencedColumns: ['id'];
          },
        ];
      };
      task_queue: {
        Row: {
          agent_id: string | null;
          completed_at: string | null;
          created_at: string | null;
          description: string;
          id: string;
          metadata: Json | null;
          parent_task_id: string | null;
          priority: number | null;
          result: Json | null;
          started_at: string | null;
          status: Database['public']['Enums']['task_status'] | null;
          task_type: string;
        };
        Insert: {
          agent_id?: string | null;
          completed_at?: string | null;
          created_at?: string | null;
          description: string;
          id?: string;
          metadata?: Json | null;
          parent_task_id?: string | null;
          priority?: number | null;
          result?: Json | null;
          started_at?: string | null;
          status?: Database['public']['Enums']['task_status'] | null;
          task_type: string;
        };
        Update: {
          agent_id?: string | null;
          completed_at?: string | null;
          created_at?: string | null;
          description?: string;
          id?: string;
          metadata?: Json | null;
          parent_task_id?: string | null;
          priority?: number | null;
          result?: Json | null;
          started_at?: string | null;
          status?: Database['public']['Enums']['task_status'] | null;
          task_type?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'task_queue_agent_id_fkey';
            columns: ['agent_id'];
            isOneToOne: false;
            referencedRelation: 'agent_instances';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'task_queue_parent_task_id_fkey';
            columns: ['parent_task_id'];
            isOneToOne: false;
            referencedRelation: 'task_queue';
            referencedColumns: ['id'];
          },
        ];
      };
      timesheet_entries: {
        Row: {
          approved_at: string | null;
          approved_by: string | null;
          created_at: string;
          date: string;
          host_org_id: string;
          hours_worked: number;
          id: string;
          rate_amount: number;
          rate_type: string;
          status: string;
          total_amount: number;
          updated_at: string;
          worker_id: string;
        };
        Insert: {
          approved_at?: string | null;
          approved_by?: string | null;
          created_at?: string;
          date: string;
          host_org_id: string;
          hours_worked: number;
          id?: string;
          rate_amount: number;
          rate_type: string;
          status: string;
          total_amount: number;
          updated_at?: string;
          worker_id: string;
        };
        Update: {
          approved_at?: string | null;
          approved_by?: string | null;
          created_at?: string;
          date?: string;
          host_org_id?: string;
          hours_worked?: number;
          id?: string;
          rate_amount?: number;
          rate_type?: string;
          status?: string;
          total_amount?: number;
          updated_at?: string;
          worker_id?: string;
        };
        Relationships: [];
      };
      training_contracts: {
        Row: {
          aqf_level: string | null;
          contract_end_date: string | null;
          contract_start_date: string;
          contract_status: string | null;
          created_at: string | null;
          employee_id: string;
          gto_id: string | null;
          host_employer_id: string | null;
          id: string;
          notes: string | null;
          updated_at: string | null;
        };
        Insert: {
          aqf_level?: string | null;
          contract_end_date?: string | null;
          contract_start_date: string;
          contract_status?: string | null;
          created_at?: string | null;
          employee_id: string;
          gto_id?: string | null;
          host_employer_id?: string | null;
          id?: string;
          notes?: string | null;
          updated_at?: string | null;
        };
        Update: {
          aqf_level?: string | null;
          contract_end_date?: string | null;
          contract_start_date?: string;
          contract_status?: string | null;
          created_at?: string | null;
          employee_id?: string;
          gto_id?: string | null;
          host_employer_id?: string | null;
          id?: string;
          notes?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'training_contracts_employee_id_fkey';
            columns: ['employee_id'];
            isOneToOne: false;
            referencedRelation: 'employees';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'training_contracts_gto_id_fkey';
            columns: ['gto_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'training_contracts_host_employer_id_fkey';
            columns: ['host_employer_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      training_courses: {
        Row: {
          aqf_level: string | null;
          created_at: string | null;
          id: string;
          name: string;
          rto_code: string | null;
          rto_name: string | null;
          updated_at: string | null;
        };
        Insert: {
          aqf_level?: string | null;
          created_at?: string | null;
          id?: string;
          name: string;
          rto_code?: string | null;
          rto_name?: string | null;
          updated_at?: string | null;
        };
        Update: {
          aqf_level?: string | null;
          created_at?: string | null;
          id?: string;
          name?: string;
          rto_code?: string | null;
          rto_name?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      trend_predictions: {
        Row: {
          category: string;
          confidence_score: number | null;
          created_at: string | null;
          id: string;
          idea_id: string | null;
          prediction_text: string;
          supporting_data: Json | null;
          timeframe_end: string | null;
          timeframe_start: string | null;
          trend_name: string;
          updated_at: string | null;
        };
        Insert: {
          category: string;
          confidence_score?: number | null;
          created_at?: string | null;
          id?: string;
          idea_id?: string | null;
          prediction_text: string;
          supporting_data?: Json | null;
          timeframe_end?: string | null;
          timeframe_start?: string | null;
          trend_name: string;
          updated_at?: string | null;
        };
        Update: {
          category?: string;
          confidence_score?: number | null;
          created_at?: string | null;
          id?: string;
          idea_id?: string | null;
          prediction_text?: string;
          supporting_data?: Json | null;
          timeframe_end?: string | null;
          timeframe_start?: string | null;
          trend_name?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'trend_predictions_idea_id_fkey';
            columns: ['idea_id'];
            isOneToOne: false;
            referencedRelation: 'ideas';
            referencedColumns: ['id'];
          },
        ];
      };
      user_profiles: {
        Row: {
          created_at: string;
          email: string;
          first_name: string | null;
          id: string;
          last_name: string | null;
          role: Database['public']['Enums']['user_role'];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          first_name?: string | null;
          id: string;
          last_name?: string | null;
          role?: Database['public']['Enums']['user_role'];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          first_name?: string | null;
          id?: string;
          last_name?: string | null;
          role?: Database['public']['Enums']['user_role'];
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string | null;
          id: string;
          org_id: string | null;
          role: Database['public']['Enums']['user_role'];
          team_id: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          org_id?: string | null;
          role?: Database['public']['Enums']['user_role'];
          team_id?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          org_id?: string | null;
          role?: Database['public']['Enums']['user_role'];
          team_id?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'user_roles_org_id_fkey';
            columns: ['org_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      web_search_results: {
        Row: {
          created_at: string | null;
          embedding: string | null;
          id: string;
          metadata: Json | null;
          org_id: string | null;
          query: string;
          snippet: string | null;
          team_id: string | null;
          title: string | null;
          url: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          embedding?: string | null;
          id?: string;
          metadata?: Json | null;
          org_id?: string | null;
          query: string;
          snippet?: string | null;
          team_id?: string | null;
          title?: string | null;
          url: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          embedding?: string | null;
          id?: string;
          metadata?: Json | null;
          org_id?: string | null;
          query?: string;
          snippet?: string | null;
          team_id?: string | null;
          title?: string | null;
          url?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'web_search_results_org_id_fkey';
            columns: ['org_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      },
      editor_analytics: {
        Row: {
          id: string;
          created_at: string;
          action: string;
          page_id: string;
          user_email: string;
          metadata: {
            componentCount: number;
            timestamp: string;
          };
        };
        Insert: {
          action: string;
          page_id: string;
          user_email: string;
          metadata: {
            componentCount: number;
            timestamp: string;
          };
        };
        Update: {
          action?: string;
          page_id?: string;
          user_email?: string;
          metadata?: {
            componentCount?: number;
            timestamp?: string;
          };
        };
      };
    };
    Views: {
      mv_app_opportunity_analytics: {
        Row: {
          avg_value: number | null;
          opportunity_count: number | null;
          org_id: string | null;
          status: string | null;
          total_value: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_app_opportunities_org_id';
            columns: ['org_id'];
            isOneToOne: false;
            referencedRelation: 'app_organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      mv_rate_analytics: {
        Row: {
          annual_revenue_potential: number | null;
          avg_base_rate: number | null;
          avg_charge_rate: number | null;
          avg_leave_cost: number | null;
          avg_margin_percent: number | null;
          avg_markup_percent: number | null;
          avg_statutory_cost: number | null;
          avg_total_cost: number | null;
          avg_training_cost: number | null;
          award_code: string | null;
          classification: string | null;
          host_org_id: string | null;
          worker_count: number | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      binary_quantize:
        | {
            Args: {
              '': string;
            };
            Returns: unknown;
          }
        | {
            Args: {
              '': unknown;
            };
            Returns: unknown;
          };
      calculate_hourly_rate: {
        Args: {
          annual_amount: number;
          hours_per_year: number;
        };
        Returns: number;
      };
      example_function: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      get_page_parents: {
        Args: {
          page_id: number;
        };
        Returns: {
          id: number;
          parent_page_id: number;
          path: string;
          meta: Json;
        }[];
      };
      get_secret: {
        Args: {
          name: string;
        };
        Returns: {
          secret: string;
        }[];
      };
      get_user_role: {
        Args: {
          org_id: string;
        };
        Returns: Database['public']['Enums']['user_role'];
      };
      gtrgm_compress: {
        Args: {
          '': unknown;
        };
        Returns: unknown;
      };
      gtrgm_decompress: {
        Args: {
          '': unknown;
        };
        Returns: unknown;
      };
      gtrgm_in: {
        Args: {
          '': unknown;
        };
        Returns: unknown;
      };
      gtrgm_options: {
        Args: {
          '': unknown;
        };
        Returns: undefined;
      };
      gtrgm_out: {
        Args: {
          '': unknown;
        };
        Returns: unknown;
      };
      halfvec_avg: {
        Args: {
          '': number[];
        };
        Returns: unknown;
      };
      halfvec_out: {
        Args: {
          '': unknown;
        };
        Returns: unknown;
      };
      halfvec_send: {
        Args: {
          '': unknown;
        };
        Returns: string;
      };
      halfvec_typmod_in: {
        Args: {
          '': unknown[];
        };
        Returns: number;
      };
      has_org_access: {
        Args: {
          org_id: string;
        };
        Returns: boolean;
      };
      has_team_access: {
        Args: {
          team_id: string;
        };
        Returns: boolean;
      };
      hnsw_bit_support: {
        Args: {
          '': unknown;
        };
        Returns: unknown;
      };
      hnsw_halfvec_support: {
        Args: {
          '': unknown;
        };
        Returns: unknown;
      };
      hnsw_sparsevec_support: {
        Args: {
          '': unknown;
        };
        Returns: unknown;
      };
      hnswhandler: {
        Args: {
          '': unknown;
        };
        Returns: unknown;
      };
      is_dev: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      ivfflat_bit_support: {
        Args: {
          '': unknown;
        };
        Returns: unknown;
      };
      ivfflat_halfvec_support: {
        Args: {
          '': unknown;
        };
        Returns: unknown;
      };
      ivfflathandler: {
        Args: {
          '': unknown;
        };
        Returns: unknown;
      };
      l2_norm:
        | {
            Args: {
              '': unknown;
            };
            Returns: number;
          }
        | {
            Args: {
              '': unknown;
            };
            Returns: number;
          };
      l2_normalize:
        | {
            Args: {
              '': string;
            };
            Returns: string;
          }
        | {
            Args: {
              '': unknown;
            };
            Returns: unknown;
          }
        | {
            Args: {
              '': unknown;
            };
            Returns: unknown;
          };
      match_documents: {
        Args: {
          query_embedding: string;
          match_count?: number;
          filter?: Json;
        };
        Returns: {
          id: number;
          content: string;
          metadata: Json;
          similarity: number;
        }[];
      };
      match_memories: {
        Args: {
          query_embedding: string;
          match_threshold: number;
          match_count: number;
        };
        Returns: {
          id: string;
          content: string;
          similarity: number;
        }[];
      };
      match_page_sections: {
        Args: {
          embedding: string;
          match_threshold: number;
          match_count: number;
          min_content_length: number;
        };
        Returns: {
          id: number;
          page_id: number;
          slug: string;
          heading: string;
          content: string;
          similarity: number;
        }[];
      };
      prune_old_messages: {
        Args: {
          days_to_keep: number;
        };
        Returns: undefined;
      };
      set_limit: {
        Args: {
          '': number;
        };
        Returns: number;
      };
      set_secret: {
        Args: {
          secret_name: string;
          secret_value: string;
        };
        Returns: undefined;
      };
      show_limit: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      show_trgm: {
        Args: {
          '': string;
        };
        Returns: string[];
      };
      sparsevec_out: {
        Args: {
          '': unknown;
        };
        Returns: unknown;
      };
      sparsevec_send: {
        Args: {
          '': unknown;
        };
        Returns: string;
      };
      sparsevec_typmod_in: {
        Args: {
          '': unknown[];
        };
        Returns: number;
      };
      vector_avg: {
        Args: {
          '': number[];
        };
        Returns: string;
      };
      vector_dims:
        | {
            Args: {
              '': string;
            };
            Returns: number;
          }
        | {
            Args: {
              '': unknown;
            };
            Returns: number;
          };
      vector_norm: {
        Args: {
          '': string;
        };
        Returns: number;
      };
      vector_out: {
        Args: {
          '': string;
        };
        Returns: unknown;
      };
      vector_send: {
        Args: {
          '': string;
        };
        Returns: string;
      };
      vector_typmod_in: {
        Args: {
          '': unknown[];
        };
        Returns: number;
      };
    };
    Enums: {
      agent_type:
        | 'orchestrator'
        | 'web_navigation'
        | 'credential_management'
        | 'document_processing'
        | 'communication'
        | 'code_execution'
        | 'browser_extension'
        | 'visual_analysis';
      task_status: 'pending' | 'in_progress' | 'completed' | 'failed';
      user_role: 'dev' | 'org_admin' | 'team_admin' | 'team_member' | 'user';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    ? (PublicSchema['Tables'] & PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends keyof PublicSchema['Enums'] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
    ? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;
