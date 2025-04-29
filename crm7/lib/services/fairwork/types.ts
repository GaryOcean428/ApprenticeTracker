import type { 
  Award,
  Classification,
  PayRate,
  RateTemplate,
  RateValidationRequest,
  RateValidationResponse,
  ClassificationHierarchy,
  PayCalculation
} from './fairwork.types';

// Re-export all types
export type {
  Award,
  Classification,
  PayRate,
  RateTemplate,
  RateValidationRequest,
  RateValidationResponse,
  ClassificationHierarchy,
  PayCalculation
};

export type FairWorkEnvironment = 'production' | 'sandbox';

export interface FairWorkConfig {
  apiKey: string;
  apiUrl: string;
  environment: FairWorkEnvironment;
  timeout?: number;
  retryAttempts?: number;
  cacheEnabled?: boolean;
  cacheTTL?: number;
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

export interface FairWorkApiClient {
  getAward(awardCode: string): Promise<Award>;
  validatePayRate(params: RateValidationRequest): Promise<{ isValid: boolean; minimumRate: number; difference: number }>;
  searchAwards(params: { query: string; [key: string]: any }): Promise<{ items: Award[]; total: number }>;
  getClassification(awardCode: string, classificationCode: string): Promise<Classification>;
  calculatePay(params: { 
    awardCode: string;
    classificationCode: string;
    date: string;
    employmentType: string;
    hours: number;
    penalties?: string[];
    allowances?: string[];
  }): Promise<PayCalculation>;
  getActiveAwards(): Promise<Award[]>;
  getCurrentRates(): Promise<PayRate[]>;
  getRatesForDate(date: string): Promise<PayRate[]>;
  getClassifications(awardCode: string): Promise<Classification[]>;
  getClassificationHierarchy(awardCode: string): Promise<ClassificationHierarchy | null>;
  getRateTemplates(awardCode: string): Promise<RateTemplate[]>;
  validateRateTemplate(request: RateValidationRequest): Promise<RateValidationResponse>;
  calculateBaseRate(code: string): Promise<number | null>;
}

export interface RateCalculationRequest {
  awardCode: string;
  classificationCode: string;
  date: string;
  employmentType: 'casual' | 'permanent' | 'fixed-term';
  hours: number;
  penalties?: string[];
  allowances?: string[];
}
