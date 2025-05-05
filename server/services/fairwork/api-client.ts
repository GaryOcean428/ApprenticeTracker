import axios, { AxiosInstance } from 'axios';
import logger from '../../utils/logger';

export interface FairWorkApiConfig {
  baseUrl: string;
  apiKey: string;
  environment?: string;
  timeout?: number;
}

export interface Award {
  id: string;
  code: string;
  name: string;
  fair_work_reference?: string;
  fair_work_title?: string;
  published_year?: number;
  version_number?: number;
  effective_date?: string;
  description?: string;
}

export interface Classification {
  id: string;
  award_id: string;
  name: string;
  level: string;
  description?: string;
  fair_work_level_code?: string;
  parent_classification_name?: string;
  classification_level?: number;
}

export interface PayRate {
  id: string;
  classification_id: string;
  hourly_rate: number;
  effective_from: string;
  effective_to?: string;
  is_apprentice_rate?: boolean;
  apprenticeship_year?: number;
}

export interface ClassificationHierarchy {
  levels: {
    [key: string]: {
      name: string;
      classifications: {
        code: string;
        name: string;
        level: number;
      }[];
    };
  };
}

export interface RateTemplate {
  id: string;
  name: string;
  description?: string;
  base_rate: number;
  penalties: {
    id: string;
    name: string;
    multiplier: number;
    applies_to: string[];
  }[];
  allowances: {
    id: string;
    name: string;
    amount: number;
    type: string;
  }[];
}

export interface RateValidationRequest {
  award_code: string;
  classification_code: string;
  hourly_rate: number;
  date: string;
}

export interface RateValidationResponse {
  is_valid: boolean;
  minimum_rate: number;
  difference: number;
  message?: string;
}

export interface PayCalculation {
  base_rate: number;
  hours: number;
  base_amount: number;
  penalties: {
    name: string;
    rate: number;
    amount: number;
  }[];
  allowances: {
    name: string;
    amount: number;
  }[];
  total_amount: number;
}

export class ApiError extends Error {
  statusCode: number;
  responseData: any;

  constructor(message: string, statusCode: number, responseData: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.responseData = responseData;
  }
}

/**
 * Client for interacting with the Fair Work API
 */
export class FairWorkApiClient {
  private client: AxiosInstance;

  constructor(config: FairWorkApiConfig) {
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 10000,
      headers: {
        'Ocp-Apim-Subscription-Key': config.apiKey,
        'Content-Type': 'application/json',
        'X-Environment': config.environment || 'production',
      },
    });
  }

  /**
   * Internal request method to handle API calls
   */
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

  /**
   * Get all modern awards (as per API documentation endpoint: GET /api/v1/awards)
   */
  async getActiveAwards(): Promise<Award[]> {
    try {
      return await this.request<Award[]>('/api/v1/awards');
    } catch (error) {
      logger.error('Failed to fetch active awards', { error });
      throw error;
    }
  }

  /**
   * Get a specific award by code
   */
  async getAward(code: string): Promise<Award | null> {
    try {
      return await this.request<Award>(`/awards/${code}`);
    } catch (error) {
      if ((error as ApiError).statusCode === 404) {
        return null;
      }
      logger.error('Failed to fetch award', { error, code });
      throw error;
    }
  }

  /**
   * Get classifications for all awards (as per API documentation endpoint: GET /api/v1/classifications)
   */
  async getClassifications(): Promise<Classification[]> {
    try {
      return await this.request<Classification[]>('/api/v1/classifications');
    } catch (error) {
      logger.error('Failed to fetch classifications', { error });
      throw error;
    }
  }

  /**
   * Get classifications for a specific award
   */
  async getAwardClassifications(awardCode: string): Promise<Classification[]> {
    try {
      // Filter classifications by award code
      const allClassifications = await this.getClassifications();
      return allClassifications.filter(c => c.award_id === awardCode);
    } catch (error) {
      logger.error('Failed to fetch award classifications', { error, awardCode });
      throw error;
    }
  }

  /**
   * Get classification hierarchy for an award
   */
  async getClassificationHierarchy(awardCode: string): Promise<ClassificationHierarchy | null> {
    try {
      return await this.request<ClassificationHierarchy>(`/awards/${awardCode}/classifications/hierarchy`);
    } catch (error) {
      logger.error('Failed to fetch classification hierarchy', { error, awardCode });
      return null;
    }
  }

  /**
   * Get wage allowances (as per API documentation endpoint: GET /api/v1/wage-allowances)
   */
  async getWageAllowances(): Promise<any[]> {
    try {
      return await this.request<any[]>('/api/v1/wage-allowances');
    } catch (error) {
      logger.error('Failed to fetch wage allowances', { error });
      return [];
    }
  }

  /**
   * Get expense allowances (as per API documentation endpoint: GET /api/v1/expense-allowances)
   */
  async getExpenseAllowances(): Promise<any[]> {
    try {
      return await this.request<any[]>('/api/v1/expense-allowances');
    } catch (error) {
      logger.error('Failed to fetch expense allowances', { error });
      return [];
    }
  }

  /**
   * Get penalties (as per API documentation endpoint: GET /api/v1/penalties)
   */
  async getPenalties(): Promise<any[]> {
    try {
      return await this.request<any[]>('/api/v1/penalties');
    } catch (error) {
      logger.error('Failed to fetch penalties', { error });
      return [];
    }
  }

  /**
   * Get rate templates for an award
   */
  async getRateTemplates(awardCode: string): Promise<RateTemplate[]> {
    try {
      return await this.request<RateTemplate[]>(`/awards/${awardCode}/templates`);
    } catch (error) {
      logger.error('Failed to fetch rate templates', { error, awardCode });
      return [];
    }
  }

  /**
   * Validate a pay rate against award requirements
   */
  async validateRateTemplate(request: RateValidationRequest): Promise<RateValidationResponse> {
    try {
      return await this.request<RateValidationResponse>('/rates/validate', {
        method: 'POST',
        data: request,
      });
    } catch (error) {
      logger.error('Failed to validate rate', { error, request });
      return {
        is_valid: false,
        minimum_rate: 0,
        difference: 0,
        message: 'Failed to validate rate due to API error',
      };
    }
  }

  /**
   * Calculate base rate for a classification
   */
  async calculateBaseRate(code: string): Promise<number | null> {
    try {
      const response = await this.request<{ rate: number }>(`/rates/${code}/base`);
      return response.rate;
    } catch (error) {
      logger.error('Failed to calculate base rate', { error, code });
      return null;
    }
  }

  /**
   * Calculate pay for a shift based on award rules
   */
  async calculatePay(params: {
    awardCode: string;
    classificationCode: string;
    date: string;
    employmentType: string;
    hours: number;
    penalties?: string[];
    allowances?: string[];
  }): Promise<PayCalculation> {
    try {
      return await this.request<PayCalculation>('/calculate', {
        method: 'POST',
        data: params,
      });
    } catch (error) {
      logger.error('Failed to calculate pay', { error, params });
      throw error;
    }
  }
}
