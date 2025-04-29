export class RateError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'RateError';
  }
}

export type RateTemplateStatus = 'draft' | 'active' | 'archived' | 'deleted';

export interface RateTemplate {
  id: string;
  orgId: string;
  name: string;
  templateType: 'hourly' | 'daily' | 'fixed';
  description: string | null;
  baseRate: number;
  baseMargin: number;
  superRate: number;
  leaveLoading: number;
  workersCompRate: number;
  payrollTaxRate: number;
  trainingCostRate: number;
  otherCostsRate: number;
  fundingOffset: number;
  casualLoading: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  status: RateTemplateStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  version: number;
}

export interface RateCalculation {
  templateId: string;
  baseRate: number;
  adjustments: {
    location?: number;
    skill?: number;
  };
  leave_loading_amount: number;
  training_cost_amount: number;
  other_costs_amount: number;
  funding_offset_amount: number;
  totalRate: number;
  final_rate: number;
  metadata?: Record<string, unknown>;
  calculatedAt: string;
}

export interface RateTemplateHistory {
  id: string;
  templateId: string;
  orgId: string;
  changes: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface RateAnalyticsResponse {
  data: RateAnalytics;
}

export interface RateAnalytics {
  totalTemplates: number;
  activeTemplates: number;
  averageRate: number;
  recentChanges: Array<{
    action: 'created' | 'updated';
    timestamp: string;
  }>;
}

export interface AnalyticsData {
  metrics: Record<string, number>;
  trends: Array<{ date: string; value: number }>;
  averageRate: number;
  activeTemplates: number;
  totalTemplates: number;
  recentChanges: Array<{
    id: string;
    date: string;
    description: string;
    action: string;
    timestamp: string;
  }>;
}

export interface RatesService {
  // Template Management
  getTemplates: (params: { org_id: string }) => Promise<{ data: RateTemplate[] }>;
  getRateTemplate: (id: string) => Promise<RateTemplate>;
  createRateTemplate: (template: Partial<RateTemplate>) => Promise<RateTemplate>;
  updateRateTemplate: (id: string, template: Partial<RateTemplate>) => Promise<RateTemplate>;
  updateRateTemplateStatus: (
    id: string,
    status: RateTemplateStatus,
    updatedBy: string,
  ) => Promise<void>;
  deleteRateTemplate: (id: string) => Promise<void>;
  getRateTemplateHistory: (id: string) => Promise<{ data: RateTemplateHistory[] }>;
  getRateCalculations: (id: string) => Promise<{ data: RateCalculation[] }>;

  // Rate Calculations
  validateRateTemplate: (template: RateTemplate) => Promise<boolean>;
  calculateRate: (template: RateTemplate) => Promise<number>;

  // Bulk Operations
  getBulkCalculations: (orgId: string) => Promise<{ data: BulkCalculation[] }>;
  createBulkCalculation: (params: BulkCalculationParams) => Promise<{ data: BulkCalculation }>;

  // Analytics and Employee Management
  getAnalytics: (params: { orgId: string }) => Promise<RateAnalytics>;
  getEmployees: () => Promise<{ data: RateEmployee[] }>;
}

export interface BulkCalculation {
  id: string;
  orgId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  results: Array<{
    templateId: string;
    rate: number;
    error?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface BulkCalculationParams {
  orgId: string;
  templateIds: string[];
}

export interface RateEmployee {
  id: string;
  name: string;
  role: string;
  department: string;
}

export interface RateCalculationResult {
  id: string;
  templateId: string;
  rate: number;
  effectiveDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface RateTemplateInput
  extends Omit<RateTemplate, 'id' | 'createdAt' | 'updatedAt' | 'version'> {
  id?: string;
  awardCode?: string;
  classificationCode?: string;
}

export interface RateTemplateUpdate extends Partial<RateTemplate> {
  id: string;
  orgId: string;
}

export interface RateValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
