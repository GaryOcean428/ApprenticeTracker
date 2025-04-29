export enum RateTemplateStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
}

export interface RateTemplate {
  id: string;
  name: string;
  description?: string;
  status: RateTemplateStatus;
  created_at: string;
  updated_at: string;
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

export interface RateManagementService {
  getRateTemplates(params: { orgId: string }): Promise<{ data: RateTemplate[] }>;
  getRateTemplateById(id: string): Promise<RateTemplate>;
  createRateTemplate(template: Partial<RateTemplate>): Promise<RateTemplate>;
  updateRateTemplate(id: string, template: Partial<RateTemplate>): Promise<RateTemplate>;
  deleteRateTemplate(id: string): Promise<void>;
  getRateTemplateHistory(id: string): Promise<{ data: RateTemplateHistory[] }>;
  getAnalytics(params: { orgId: string }): Promise<{ data: RateAnalytics }>;
  getBulkCalculations(orgId: string): Promise<{ data: BulkCalculation[] }>;
  createBulkCalculation(params: {
    orgId: string;
    templateIds: string[];
  }): Promise<{ data: BulkCalculation }>;
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
