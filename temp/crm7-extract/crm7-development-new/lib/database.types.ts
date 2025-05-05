export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  Tables: {
    pages: {
      Row: {
        content: Json
        created_at: string
        id: string
        path: string
        updated_at: string
      }
      Insert: {
        content?: Json
        created_at?: string
        id?: string
        path: string
        updated_at?: string
      }
      Update: {
        content?: Json
        created_at?: string
        id?: string
        path?: string
        updated_at?: string
      }
      Relationships: []
    }
    profiles: {
      Row: {
        id: string
        updated_at: string
        full_name: string
        email: string
      }
      Insert: {
        id: string
        updated_at?: string
        full_name?: string
        email?: string
      }
      Update: {
        id?: string
        updated_at?: string
        full_name?: string
        email?: string
      }
      Relationships: []
    }
    schema_changes: {
      Row: {
        id: string
        created_at: string
        change_type: string
        details: Json
      }
      Insert: {
        id?: string
        created_at?: string
        change_type: string
        details: Json
      }
      Update: {
        id?: string
        created_at?: string
        change_type?: string
        details?: Json
      }
      Relationships: []
    }
    schema_updates: {
      Row: {
        id: string
        updated_at: string
        description: string
      }
      Insert: {
        id?: string
        updated_at?: string
        description: string
      }
      Update: {
        id?: string
        updated_at?: string
        description?: string
      }
      Relationships: []
    }
    user_roles: {
      Row: {
        user_id: string
        role: string
        created_at: string
      }
      Insert: {
        user_id: string
        role: string
        created_at?: string
      }
      Update: {
        user_id?: string
        role?: string
        created_at?: string
      }
      Relationships: []
    }
    user_organizations: {
      Row: {
        user_id: string
        organization_id: string
        created_at: string
      }
      Insert: {
        user_id: string
        organization_id: string
        created_at?: string
      }
      Update: {
        user_id?: string
        organization_id?: string
        created_at?: string
      }
      Relationships: []
    }
    organizations: {
      Row: {
        id: string
        name: string
        created_at: string
      }
      Insert: {
        id?: string
        name: string
        created_at?: string
      }
      Update: {
        id?: string
        name?: string
        created_at?: string
      }
      Relationships: []
    }
    app_leads: {
      Row: {
        id: string
        name: string
        email: string
        phone: string
        status: string
        created_at: string
        organization_id: string
      }
      Insert: {
        id?: string
        name: string
        email: string
        phone?: string
        status?: string
        created_at?: string
        organization_id: string
      }
      Update: {
        id?: string
        name?: string
        email?: string
        phone?: string
        status?: string
        created_at?: string
        organization_id?: string
      }
      Relationships: []
    }
    app_organizations: {
      Row: {
        id: string
        name: string
        created_at: string
      }
      Insert: {
        id?: string
        name: string
        created_at?: string
      }
      Update: {
        id?: string
        name?: string
        created_at?: string
      }
      Relationships: []
    }
    app_opportunities: {
      Row: {
        id: string
        title: string
        value: number
        status: string
        created_at: string
        organization_id: string
      }
      Insert: {
        id?: string
        title: string
        value: number
        status?: string
        created_at?: string
        organization_id: string
      }
      Update: {
        id?: string
        title?: string
        value?: number
        status?: string
        created_at?: string
        organization_id?: string
      }
      Relationships: []
    }
  }
  Views: {
    [_ in never]: never
  }
  Functions: {
    [_ in never]: never
  }
  Enums: {
    [_ in never]: never
  }
  CompositeTypes: {
    [_ in never]: never
  }
}
