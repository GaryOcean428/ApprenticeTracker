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
   * Get all modern awards (endpoint: GET /api/v1/awards)
   */
  async getActiveAwards(): Promise<Award[]> {
    try {
      // Make request to FWC API awards endpoint
      const response = await this.request<any>('/awards');
      
      // Extract awards from the response based on API structure
      const awards = response.results || [];
      
      // Transform to our internal model
      return awards.map(a => ({
        id: a.award_fixed_id?.toString() || '',
        code: a.code || '',
        name: a.name || '',
        fair_work_reference: a.reference_number || null,
        fair_work_title: a.title || null,
        published_year: a.published_year || null,
        version_number: a.version_number || null,
        effective_date: a.award_operative_from || null,
        description: a.description || null
      }));
    } catch (error) {
      logger.error('Failed to fetch active awards', { error });
      return []; // Return empty array instead of throwing to avoid breaking syncs
    }
  }

  /**
   * Get a specific award by code
   * Endpoint: GET /api/v1/awards/{id_or_code}
   */
  async getAward(code: string): Promise<Award | null> {
    try {
      // Get the specific award by code or id
      const response = await this.request<any>(`/awards/${code}`);
      
      // Extract awards data from the response
      const awards = response.results || [];
      
      // Should only be one award, but handle it as an array just in case
      if (awards.length === 0) return null;
      
      // Take the first award in the results
      const award = awards[0];
      
      // Transform to our internal model
      return {
        id: award.award_fixed_id?.toString() || '',
        code: award.code || '',
        name: award.name || '',
        fair_work_reference: award.reference_number || null,
        fair_work_title: award.title || null,
        published_year: award.published_year || null,
        version_number: award.version_number || null,
        effective_date: award.award_operative_from || null,
        description: award.description || null
      };
    } catch (error) {
      if ((error as ApiError).statusCode === 404) {
        return null;
      }
      logger.error('Failed to fetch award', { error, code });
      return null; // Return null instead of throwing to avoid breaking syncs
    }
  }

  /**
   * Get classifications for all awards (as per API documentation endpoint)
   */
  async getClassifications(): Promise<Classification[]> {
    try {
      // The API doesn't have a single endpoint for all classifications
      // So we'll need to use the award-specific endpoint instead
      throw new Error('This method is not supported by the FWC API');
    } catch (error) {
      logger.error('Failed to fetch classifications', { error });
      throw error;
    }
  }

  /**
   * Get classifications for a specific award
   * Endpoint: GET /api/v1/awards/{id_or_code}/classifications
   */
  async getAwardClassifications(awardCode: string): Promise<Classification[]> {
    try {
      // Get classifications for this specific award
      const response = await this.request<any>(`/awards/${awardCode}/classifications`);
      
      // Extract classifications from the response based on API structure
      const classifications = response.results || [];
      
      // Transform to our internal model if needed
      return classifications.map(c => ({
        id: c.classification_fixed_id?.toString() || '',
        award_id: awardCode,
        name: c.classification || '',
        level: c.classification_level?.toString() || '',
        description: c.clause_description || '',
        fair_work_level_code: c.clause_fixed_id?.toString() || null,
        parent_classification_name: c.parent_classification_name || null
      }));
    } catch (error) {
      logger.error('Failed to fetch award classifications', { error, awardCode });
      return []; // Return empty array instead of throwing to avoid breaking syncs
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
