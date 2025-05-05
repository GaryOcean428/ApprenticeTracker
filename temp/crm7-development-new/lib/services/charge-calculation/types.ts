import type { RateTemplate } from '@/lib/types/rates';

export interface RateComponents {
  superannuation: number;
  leaveLoading: number;
  workersComp: number;
  payrollTax: number;
  trainingCosts: number;
  otherCosts: number;
  fundingOffset: number;
}

export interface RateCalculation {
  baseRate: number;
  margin: number;
  finalRate: number;
  components: RateComponents;
  leave_loading_amount: number;
  training_cost_amount: number;
  other_costs_amount: number;
  funding_offset_amount: number;
  final_rate: number;
}

export interface ChargeConfig {
  template: RateTemplate;
  hours: number;
}

export interface ChargeResult {
  totalCharge: number;
  breakdown: {
    baseCharge: number;
    adjustments: Record<string, number>;
  };
  metadata?: Record<string, unknown>;
}

export { RateTemplate };
