import { logger } from '@/lib/logger';
import axios, { type AxiosInstance } from 'axios';
import type {
  Award,
  Classification,
  ClassificationHierarchy,
  PayRate,
  RateTemplate,
  RateValidationRequest,
  RateValidationResponse,
} from './types';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface FairWorkApiConfig {
  apiKey: string;
  baseUrl: string;
  environment: 'sandbox' | 'production';
  timeout: number;
}

export interface FairWorkApiClient {
  getActiveAwards(): Promise<Award[]>;
  getAward(id: string): Promise<Award | null>;
  getCurrentRates(): Promise<PayRate[]>;
  getRatesForDate(date: string): Promise<PayRate[]>;
  getClassifications(): Promise<Classification[]>;
  getClassificationHierarchy(): Promise<ClassificationHierarchy | null>;
  getRateTemplates(): Promise<RateTemplate[]>;
  validateRateTemplate(request: RateValidationRequest): Promise<RateValidationResponse>;
  calculateBaseRate(templateId: string): Promise<number | null>;
}

export class FairWorkApiClientImpl implements FairWorkApiClient {
  private client: AxiosInstance;

  constructor(config: FairWorkApiConfig) {
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'X-Environment': config.environment,
      },
    });
  }

  private async request<T>(
    path: string,
    config: Parameters<AxiosInstance['request']>[0] = {}
  ): Promise<T> {
    try {
      const response = await this.client.request<T>({
        ...config,
        url: path,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new ApiError(error.message, error.response?.status || 500, error.response?.data);
      }
      throw error;
    }
  }

  async getActiveAwards(): Promise<Award[]> {
    try {
      return await this.request<Award[]>('/awards/active');
    } catch (error) {
      logger.error('Failed to fetch active awards', { error });
      throw error;
    }
  }

  async getAward(id: string): Promise<Award | null> {
    try {
      return await this.request<Award>(`/awards/${id}`);
    } catch (error) {
      if ((error as Error).message.includes('404')) {
        return null;
      }
      logger.error('Failed to fetch award', { error, id });
      throw error;
    }
  }

  async getCurrentRates(): Promise<PayRate[]> {
    try {
      return await this.request<PayRate[]>('/awards/active/rates/current');
    } catch (error) {
      logger.error('Failed to fetch current rates', { error });
      throw error;
    }
  }

  async getRatesForDate(date: string): Promise<PayRate[]> {
    try {
      return await this.request<PayRate[]>(`/awards/active/rates/${date}`);
    } catch (error) {
      logger.error('Failed to fetch rates for date', { error, date });
      throw error;
    }
  }

  async getClassifications(): Promise<Classification[]> {
    try {
      return await this.request<Classification[]>('/awards/active/classifications');
    } catch (error) {
      logger.error('Failed to fetch classifications', { error });
      throw error;
    }
  }

  async getClassificationHierarchy(): Promise<ClassificationHierarchy | null> {
    try {
      return await this.request<ClassificationHierarchy>(
        '/awards/active/classifications/hierarchy'
      );
    } catch (error) {
      if ((error as Error).message.includes('404')) {
        return null;
      }
      logger.error('Failed to fetch classification hierarchy', { error });
      throw error;
    }
  }

  async getRateTemplates(): Promise<RateTemplate[]> {
    try {
      return await this.request<RateTemplate[]>('/awards/active/templates');
    } catch (error) {
      logger.error('Failed to fetch rate templates', { error });
      throw error;
    }
  }

  async validateRateTemplate(request: RateValidationRequest): Promise<RateValidationResponse> {
    try {
      return await this.request<RateValidationResponse>('/rates/validate', {
        method: 'POST',
        data: request,
      });
    } catch (error) {
      logger.error('Failed to validate rate template', { error, request });
      throw error;
    }
  }

  async calculateBaseRate(templateId: string): Promise<number | null> {
    try {
      const response = await this.request<{ baseRate: number }>(`/rates/calculate/${templateId}`);
      return response.baseRate;
    } catch (error) {
      if ((error as Error).message.includes('404')) {
        return null;
      }
      logger.error('Failed to calculate base rate', { error, templateId });
      throw error;
    }
  }
}

export function createClient(config: FairWorkApiConfig): FairWorkApiClient {
  return new FairWorkApiClientImpl(config);
}
