import type { RateTemplate } from '@/lib/types/rates';

export interface RateCalculatorProps {
  orgId: string;
  onCalculate?: (rate: number) => void;
}

export interface CalculationResult {
  baseAmount: number;
  superAmount: number;
  leaveAmount: number;
  workersCompAmount: number;
  payrollTaxAmount: number;
  trainingAmount: number;
  otherAmount: number;
  totalAmount: number;
}

export interface RateCalculatorState {
  templates: RateTemplate[];
  selectedTemplate: string;
  loading: boolean;
  error: string | null;
  result: CalculationResult | null;
}

export interface RateCalculator {
  props: RateCalculatorProps;
  state: RateCalculatorState;
}
