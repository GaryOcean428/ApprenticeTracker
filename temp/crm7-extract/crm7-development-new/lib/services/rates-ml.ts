import { createClient } from '@supabase/supabase-js';

import type { Database } from '@/types/supabase';

export interface MLPrediction {
  predicted_value: number;
  confidence_score: number;
  factors: Record<string, number>;
  metadata: Record<string, any>;
}

export interface MLModelMetrics {
  mae: number;
  mse: number;
  r2_score: number;
  feature_importance: Record<string, number>;
}

export class RatesMLService {
  private supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  );

  async predictRate(params: {
    template_id: string;
    employee_id: string;
    calculation_date: Date;
    features: Record<string, any>;
  }): Promise<void> {
    const { data, error } = await this.supabase.rpc('predict_rate', params);
    if (typeof error !== "undefined" && error !== null) throw error;
    return data;
  }

  async predictMargin(params: {
    template_id: string;
    base_rate: number;
    features: Record<string, any>;
  }): Promise<void> {
    const { data, error } = await this.supabase.rpc('predict_margin', params);
    if (typeof error !== "undefined" && error !== null) throw error;
    return data;
  }

  async detectAnomalies(params: {
    org_id: string;
    start_date: Date;
    end_date: Date;
    threshold?: number;
  }): Promise<void> {
    const { data, error } = await this.supabase.rpc('detect_rate_anomalies', params);
    if (typeof error !== "undefined" && error !== null) throw error;
    return data;
  }

  async optimizeRates(params: {
    template_id: string;
    target_margin: number;
    constraints: Record<string, any>;
  }): Promise<void> {
    const { data, error } = await this.supabase.rpc('optimize_rates', params);
    if (typeof error !== "undefined" && error !== null) throw error;
    return data;
  }

  async getModelMetrics(params: {
    model_type: 'rate_prediction' | 'margin_prediction' | 'anomaly_detection';
    start_date: Date;
    end_date: Date;
  }): Promise<void> {
    const { data, error } = await this.supabase.rpc('get_ml_model_metrics', params);
    if (typeof error !== "undefined" && error !== null) throw error;
    return data;
  }

  async trainModel(params: {
    model_type: 'rate_prediction' | 'margin_prediction' | 'anomaly_detection';
    training_start_date: Date;
    training_end_date: Date;
    hyperparameters?: Record<string, any>;
  }): Promise<void> {
    const { data, error } = await this.supabase.rpc('train_ml_model', params);
    if (typeof error !== "undefined" && error !== null) throw error;
    return data;
  }
}

export const ratesMLService = new RatesMLService();
