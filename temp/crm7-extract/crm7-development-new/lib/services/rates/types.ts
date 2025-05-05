export enum RateTemplateStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
}

export interface RateTemplate {
  id: string;
  orgId: string;
  name: string;
  templateType: 'hourly' | 'daily' | 'fixed';
  description?: string;
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
  effectiveTo?: string;
  status: RateTemplateStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  version: number;
}

export interface BulkCalculation {
  id: string;
  status: string;
  results: Array<RateCalculation>;
  created_at: string;
  updated_at: string;
}

export interface RateTemplateHistory {
  id: string;
  template_id: string;
  changes: Record<string, unknown>;
  created_at: string;
}

export interface RateCalculation {
  id: string;
  template_id: string;
  result: number;
  created_at: string;
}

export interface RateAnalytics {
  totalTemplates: number;
  activeTemplates: number;
  averageRate: number;
  recentChanges: Array<{
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

export interface RateManagementService {
  getRateTemplates(orgId: string): Promise<RateTemplate[]>;
  getRateTemplate(id: string): Promise<RateTemplate | null>;
  createRateTemplate(template: Partial<RateTemplate>): Promise<RateTemplate>;
  updateRateTemplate(id: string, template: Partial<RateTemplate>): Promise<RateTemplate>;
  updateRateTemplateStatus(
    id: string,
    status: RateTemplateStatus,
    updatedBy: string
  ): Promise<void>;
  deleteRateTemplate(id: string): Promise<void>;
  getRateTemplateHistory(id: string): Promise<RateTemplateHistory[]>;
  getRateCalculations(id: string): Promise<RateCalculation[]>;
  validateRateTemplate(template: RateTemplate): Promise<{ isValid: boolean }>;
  calculateRate(template: RateTemplate): Promise<{ rate: number }>;
  getBulkCalculations(orgId: string): Promise<BulkCalculation[]>;
  createBulkCalculation(params: BulkCalculationParams): Promise<BulkCalculation>;
  getAnalytics(orgId: string): Promise<{ data: RateAnalytics }>;
}

export interface BulkCalculationParams {
  orgId: string;
  templateIds: string[];
  options?: Record<string, unknown>;
}

export interface RateEmployee {
  id: string;
  name: string;
  email: string;
  department?: string;
  position?: string;
  startDate: string;
}

export class RateError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'RateError';
  }
}
