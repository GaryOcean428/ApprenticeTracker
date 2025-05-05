import axios, { isAxiosError, type AxiosInstance } from 'axios';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { FairWorkApiError } from '@/lib/fairwork/client';
import type {
  Award,
  Classification,
  PayRate,
  RateTemplate,
  RateValidationRequest,
  RateValidationResponse,
  ClassificationHierarchy,
  PayCalculation,
  Penalty,
  Allowance,
  LeaveEntitlement,
  PublicHoliday
} from './fairwork.types';

const configSchema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
  apiUrl: z.string().url('API URL must be a valid URL'),
  environment: z.enum(['sandbox', 'production']),
  timeout: z.number().positive('Timeout must be a positive number'),
});

export type FairWorkConfig = z.infer<typeof configSchema>;

export class FairWorkClient {
  private readonly client: AxiosInstance;

  constructor(config: FairWorkConfig) {
    try {
      configSchema.parse(config);
    } catch (error) {
      throw new Error(`Invalid config: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    this.client = axios.create({
      baseURL: config.apiUrl,
      timeout: config.timeout,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'X-Environment': config.environment,
      },
    });
  }

  async getAward(awardCode: string): Promise<Award> {
    try {
      const response = await this.client.get(`/awards/${awardCode}`);
      return response.data;
    } catch (error) {
      return this.handleError(error, 'getAward');
    }
  }

  async validatePayRate(params: { rate: number; awardCode: string; classificationCode: string }): Promise<{ isValid: boolean; minimumRate: number; difference: number }> {
    try {
      const { awardCode, classificationCode, ...rest } = params;
      const response = await this.client.post(
        `/awards/${awardCode}/classifications/${classificationCode}/validate`,
        rest
      );
      return response.data;
    } catch (error) {
      return this.handleError(error, 'validatePayRate');
    }
  }

  async searchAwards(params: { query: string; [key: string]: any }): Promise<{ items: Award[]; total: number }> {
    try {
      const response = await this.client.get('/awards', { params });
      return response.data;
    } catch (error) {
      return this.handleError(error, 'searchAwards');
    }
  }

  async getClassification(awardCode: string, classificationCode: string): Promise<Classification> {
    try {
      const response = await this.client.get(`/awards/${awardCode}/classifications/${classificationCode}`);
      return response.data;
    } catch (error) {
      return this.handleError(error, 'getClassification');
    }
  }

  async calculatePay(params: { awardCode: string; classificationCode: string; date: string; employmentType: string; hours: number; penalties?: string[]; allowances?: string[] }): Promise<PayCalculation> {
    try {
      const { awardCode, classificationCode, ...rest } = params;
      const response = await this.client.post(
        `/awards/${awardCode}/classifications/${classificationCode}/calculate`,
        rest
      );
      return response.data;
    } catch (error) {
      return this.handleError(error, 'calculatePay');
    }
  }

  async getPenalties(awardCode: string, params: { date: string }): Promise<Penalty[]> {
    try {
      const response = await this.client.get(`/awards/${awardCode}/penalties`, { params });
      return response.data;
    } catch (error) {
      return this.handleError(error, 'getPenalties');
    }
  }

  async getAllowances(awardCode: string, params: { date: string }): Promise<Allowance[]> {
    try {
      const response = await this.client.get(`/awards/${awardCode}/allowances`, { params });
      return response.data;
    } catch (error) {
      return this.handleError(error, 'getAllowances');
    }
  }

  async getLeaveEntitlements(awardCode: string, params: { employmentType: string; date: string }): Promise<LeaveEntitlement[]> {
    try {
      const response = await this.client.get(`/awards/${awardCode}/leave-entitlements`, { params });
      return response.data;
    } catch (error) {
      return this.handleError(error, 'getLeaveEntitlements');
    }
  }

  async getPublicHolidays(params: { state?: string; year?: number }): Promise<PublicHoliday[]> {
    try {
      const response = await this.client.get('/public-holidays', { params });
      return response.data;
    } catch (error) {
      return this.handleError(error, 'getPublicHolidays');
    }
  }

  async getActiveAwards(): Promise<Award[]> {
    try {
      const response = await this.client.get('/awards/active');
      return response.data;
    } catch (error) {
      return this.handleError(error, 'getActiveAwards');
    }
  }

  async getCurrentRates(): Promise<PayRate[]> {
    try {
      const response = await this.client.get('/rates/current');
      return response.data;
    } catch (error) {
      return this.handleError(error, 'getCurrentRates');
    }
  }

  async getRatesForDate(date: string): Promise<PayRate[]> {
    try {
      const response = await this.client.get(`/rates/${date}`);
      return response.data;
    } catch (error) {
      return this.handleError(error, 'getRatesForDate');
    }
  }

  async getClassifications(awardCode: string): Promise<Classification[]> {
    try {
      const response = await this.client.get(`/awards/${awardCode}/classifications`);
      return response.data;
    } catch (error) {
      return this.handleError(error, 'getClassifications');
    }
  }

  async getClassificationHierarchy(awardCode: string): Promise<ClassificationHierarchy | null> {
    try {
      const response = await this.client.get(`/awards/${awardCode}/classifications/hierarchy`);
      return response.data;
    } catch (error) {
      return this.handleError(error, 'getClassificationHierarchy');
    }
  }

  async getRateTemplates(awardCode: string): Promise<RateTemplate[]> {
    try {
      const response = await this.client.get(`/awards/${awardCode}/templates`);
      return response.data;
    } catch (error) {
      return this.handleError(error, 'getRateTemplates');
    }
  }

  async validateRateTemplate(request: RateValidationRequest): Promise<RateValidationResponse> {
    try {
      const response = await this.client.post('/rates/validate', request);
      return response.data;
    } catch (error) {
      return this.handleError(error, 'validateRateTemplate');
    }
  }

  async calculateBaseRate(code: string): Promise<number | null> {
    try {
      const response = await this.client.get(`/rates/${code}/base`);
      return response.data.rate;
    } catch (error) {
      return this.handleError(error, 'calculateBaseRate');
    }
  }

  private handleError(error: unknown, context: string): never {
    logger.error(`FairWork API ${context} error`, { error });

    if (isAxiosError(error)) {
      const message = error.response?.data?.message ?? error.message ?? 'Unknown API error';
      const statusCode = error.response?.status ?? 500;
      throw new FairWorkApiError(message, statusCode, { context, error: error.response?.data });
    }

    if (error instanceof Error) {
      throw new FairWorkApiError(error.message, 500, {
        context,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      });
    }

    throw new FairWorkApiError('Unknown error occurred', 500, { context, error });
  }
}

export function createClient(config: FairWorkConfig): FairWorkClient {
  return new FairWorkClient(config);
}
