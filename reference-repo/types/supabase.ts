import { type Database as DatabaseGenerated } from './supabase-generated';

export type Database = DatabaseGenerated;

// Common Types
export interface Organization {
  id: string;
  name: string;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface RateTemplate {
  id: string;
  name: string;
  description?: string;
  org_id: string;
  template_name: string;
  template_type: 'apprentice' | 'trainee' | 'casual' | 'permanent' | 'contractor';
  base_margin: number;
  super_rate: number;
  leave_loading?: number;
  workers_comp_rate: number;
  payroll_tax_rate: number;
  training_cost_rate?: number;
  other_costs_rate?: number;
  funding_offset?: number;
  effective_from: Date;
  effective_to?: Date;
  is_active: boolean;
  is_approved: boolean;
  version_number: number;
  rules: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

export interface RateTemplateHistory {
  id: string;
  template_id: string;
  version: number;
  changes: Record<string, unknown>;
  created_at: string;
  created_by: string;
}

export interface RateCalculation {
  id: string;
  template_id: string;
  employee_id: string;
  base_rate: number;
  casual_loading?: number;
  allowances: unknown[];
  penalties: unknown[];
  super_amount: number;
  leave_loading_amount?: number;
  workers_comp_amount: number;
  payroll_tax_amount: number;
  training_cost_amount?: number;
  other_costs_amount?: number;
  funding_offset_amount?: number;
  margin_amount: number;
  total_cost: number;
  final_rate: number;
  calculation_date: Date;
  metadata: Record<string, unknown>;
}

export interface RateCalculationResult {
  id: string;
  template_id: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  status: 'success' | 'error';
  error?: string;
  created_at: string;
}

export interface BulkCalculation {
  id: string;
  template_id: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  total_records: number;
  processed_records: number;
  error_records: number;
  created_at: string;
  updated_at: string;
  metadata: Record<string, unknown>;
}

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
  metadata?: Record<string, unknown>;
}

export interface RateValidationRequest {
  template_id: string;
  input: Record<string, unknown>;
}

export interface RateValidationResponse {
  result: ValidationResult;
  metadata?: Record<string, unknown>;
}

export interface RateCalculationRequest {
  template_id: string;
  input: Record<string, unknown>;
}

export interface RateCalculationResponse {
  result: RateCalculationResult;
  metadata?: Record<string, unknown>;
}

export interface BulkCalculationRequest {
  template_id: string;
  inputs: Record<string, unknown>[];
  metadata?: Record<string, unknown>;
}

export interface BulkCalculationResponse {
  id: string;
  status: BulkCalculation['status'];
  metadata?: Record<string, unknown>;
}

export interface ValidationRule {
  id: string;
  org_id: string;
  rule_name: string;
  rule_type: 'range' | 'required' | 'comparison' | 'custom';
  field_name: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'between';
  value: unknown;
  error_message: string;
  is_active: boolean;
  priority: number;
  metadata?: Record<string, unknown>;
}

export interface MLPrediction {
  predicted_value: number;
  confidence_score: number;
  factors: Record<string, number>;
  metadata: Record<string, unknown>;
}

export interface MLModelMetrics {
  mae: number;
  mse: number;
  r2_score: number;
  feature_importance: Record<string, number>;
}

export interface IntegrationConfig {
  id: string;
  org_id: string;
  integration_type: 'payroll' | 'hr' | 'accounting' | 'custom';
  provider: string;
  credentials: Record<string, unknown>;
  settings: Record<string, unknown>;
  is_active: boolean;
  metadata?: Record<string, unknown>;
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface DatabaseError {
  message: string;
  code?: string;
  status?: number;
  details?: string;
  cause?: Error;
}
