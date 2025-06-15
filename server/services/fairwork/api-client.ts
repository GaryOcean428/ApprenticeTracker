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
  rate_description?: string;
  base_classification?: string;
  base_percentage?: number;
  // Fields from FWA API that might be useful for PayRate
  employeeRateTypeCode?: string;
  classificationFixedId?: number;
}

// New detailed Allowance interface
export interface AllowanceWithValue {
  id: string; // e.g., wage_allowance_fixed_id from API
  code?: string; // Official code if available (e.g., from allowanceCode)
  name: string; // Description or title of the allowance (e.g., from description)
  value: number; // The monetary value of the allowance (e.g., from allowance_amount)
  unit: string; // e.g., 'per week', 'per hour', 'per day' (e.g., from payment_frequency)
  effective_from: string; // YYYY-MM-DD
  effective_to?: string | null; // YYYY-MM-DD or null
  allowanceFixedId?: number; // FWA specific ID
  allowanceTypeDescription?: string; // e.g. "All Purpose"
  paymentType?: string; // e.g. "Payable"
  // Add any other relevant fields returned by the FWA API for wage allowances
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
    // Log configuration for debugging (don't log the actual API key)
    logger.info('Creating Fair Work API client', { 
      baseUrl: config.baseUrl,
      hasApiKey: !!config.apiKey,
      environment: config.environment || 'production'
    });
    
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
      return awards.map((a: any) => ({
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
      return classifications.map((c: any) => ({
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
   * Get wage allowances for a specific award
   * Endpoint: GET /api/v1/awards/{id_or_code}/wage-allowances
   */
  async getWageAllowances(awardCode: string, options?: { operativeFrom?: string, operativeTo?: string }): Promise<AllowanceWithValue[]> {
    const params: Record<string, string> = { };
    // Note: FWA API for wage-allowances might not support operative_from/to in query.
    // If so, client-side filtering will be essential (handled in getEffectiveAwardAllowance).
    // For now, let's pass them if provided, assuming API might support it or ignore gracefully.
    if (options?.operativeFrom) params.operative_from = options.operativeFrom;
    if (options?.operativeTo) params.operative_to = options.operativeTo;

    try {
      const response = await this.request<any>( // AxiosInstance returns any for data by default
        `/awards/${awardCode}/wage-allowances`,
        { params }
      );

      const rawAllowances = response.results || [];
      if (!Array.isArray(rawAllowances)) {
        logger.warn(`Unexpected response structure for wage allowances, award ${awardCode}:`, response);
        return [];
      }

      return rawAllowances.map((item: any) => ({
        id: item.wage_allowance_fixed_id?.toString() || `synthetic-${item.allowance_code || Math.random().toString(36).substring(2, 9)}`,
        code: item.allowance_code,
        name: item.description || "Unknown Allowance",
        value: parseFloat(item.allowance_amount) || 0,
        unit: item.payment_frequency || "N/A",
        effective_from: item.operative_from || item.effective_from || new Date(0).toISOString().split('T')[0], // Ensure a default valid date
        effective_to: item.operative_to || item.effective_to, // Can be null
        allowanceFixedId: item.wage_allowance_fixed_id,
        allowanceTypeDescription: item.allowance_type_description,
        paymentType: item.payment_type
      })) as AllowanceWithValue[];
    } catch (error: any) {
      logger.error(
        `Error fetching wage allowances for award ${awardCode}: ${error.message}`,
        { status: (error as ApiError).statusCode, data: (error as ApiError).responseData, awardCode, options }
      );
      return []; // Return empty array on error to allow other operations to proceed.
    }
  }

  /**
   * Get expense allowances for a specific award
   * Endpoint: GET /api/v1/awards/{id_or_code}/expense-allowances
   */
  async getExpenseAllowances(awardCode: string): Promise<any[]> {
    try {
      const response = await this.request<any>(`/awards/${awardCode}/expense-allowances`);
      // Extract expense allowances from the response based on API structure
      const allowances = response.results || [];
      return allowances;
    } catch (error) {
      logger.error('Failed to fetch expense allowances', { error, awardCode });
      return [];
    }
  }

  /**
   * Get penalties for a specific award
   * Endpoint: GET /api/v1/awards/{id_or_code}/penalties
   */
  async getPenalties(awardCode: string): Promise<any[]> {
    try {
      const response = await this.request<any>(`/awards/${awardCode}/penalties`);
      // Extract penalties from the response based on API structure
      const penalties = response.results || [];
      return penalties;
    } catch (error) {
      logger.error('Failed to fetch penalties', { error, awardCode });
      return [];
    }
  }

  /**
   * Get pay rates for a specific award
   * Endpoint: GET /api/v1/awards/{id_or_code}/pay-rates
   */
  async getPayRates(awardCode: string, options: {
    classificationLevel?: number;
    classificationFixedId?: number;
    employeeRateTypeCode?: string;
    operativeFrom?: string;
    operativeTo?: string;
    apprenticeYear?: number;
  } = {}): Promise<PayRate[]> {
    try {
      // Build query parameters
      const params: Record<string, string> = {};
      if (options.classificationLevel) params.classification_level = options.classificationLevel.toString();
      if (options.classificationFixedId) params.classification_fixed_id = options.classificationFixedId.toString();
      if (options.employeeRateTypeCode) params.employee_rate_type_code = options.employeeRateTypeCode;
      if (options.operativeFrom) params.operative_from = options.operativeFrom;
      if (options.operativeTo) params.operative_to = options.operativeTo;
      if (options.apprenticeYear) params.apprentice_year = options.apprenticeYear.toString();
      
      // Make the request with query parameters
      const queryString = new URLSearchParams(params).toString();
      const url = `/awards/${awardCode}/pay-rates${queryString ? `?${queryString}` : ''}`;
      
      const response = await this.request<any>(url);
      
      // Extract pay rates from the response
      const rates = response.results || [];
      
      // Transform to our internal model
      return rates.map((r: any) => ({
        id: r.calculated_pay_rate_id?.toString() || '',
        classification_id: r.classification_fixed_id?.toString() || '',
        hourly_rate: parseFloat(r.hourly_rate) || 0,
        effective_from: r.operative_from || '',
        effective_to: r.operative_to || undefined,
        is_apprentice_rate: r.employee_rate_type_code === 'AP', // AP = Apprentice
        apprenticeship_year: r.apprentice_year ? parseInt(r.apprentice_year) : undefined,
        rate_description: r.classification || '',
        base_classification: r.parent_classification_name || '',
        base_percentage: r.percentage_of_standard_rate ? parseFloat(r.percentage_of_standard_rate) : undefined
      }));
    } catch (error) {
      logger.error('Failed to fetch pay rates', { error, awardCode, options });
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

  /**
   * Get apprentice pay rates for a specific award
   * Uses the API's apprentice-specific filtering
   * @param awardCode The award code (e.g., MA000025)
   * @param apprenticeYear The year of apprenticeship (1-4)
   * @param options Additional options for filtering
   */
  async getApprenticeRates(
    awardCode: string, 
    apprenticeYear?: number,
    options: {
      isAdult?: boolean;
      hasCompletedYear12?: boolean;
      operativeFrom?: string;
      operativeTo?: string;
    } = {}
  ): Promise<PayRate[]> {
    try {
      // Set up options for calling the pay rates endpoint
      const payRateOptions: any = {
        employeeRateTypeCode: 'AP', // AP = Apprentice in Fair Work API
      };
      
      // Add apprentice year if provided
      if (apprenticeYear) {
        payRateOptions.apprenticeYear = apprenticeYear;
      }
      
      // Add operative date range if provided
      if (options.operativeFrom) payRateOptions.operativeFrom = options.operativeFrom;
      if (options.operativeTo) payRateOptions.operativeTo = options.operativeTo;
      
      // Get apprentice rates from the API
      const rates = await this.getPayRates(awardCode, payRateOptions);
      
      // If no rates are returned, try the fallback calculation
      if (rates.length === 0) {
        logger.info('No apprentice rates found directly, trying fallback calculation', { 
          awardCode, apprenticeYear, options 
        });
        return await this.calculateApprenticeRatesByReference(awardCode, apprenticeYear, options);
      }
      
      // Sort rates by most recent effective date
      return rates.sort((a, b) => {
        return new Date(b.effective_from).getTime() - new Date(a.effective_from).getTime();
      });
    } catch (error) {
      logger.error('Failed to fetch apprentice rates', { error, awardCode, apprenticeYear });
      // If direct API call fails, try the fallback approach
      return await this.calculateApprenticeRatesByReference(awardCode, apprenticeYear, options);
    }
  }
  
  /**
   * Calculate apprentice rates based on reference classification percentages
   * This is a fallback when direct API calls for apprentice rates don't return results
   * Implements the percentage-based calculations defined in the awards
   */
  private async calculateApprenticeRatesByReference(
    awardCode: string,
    apprenticeYear?: number,
    options: {
      isAdult?: boolean;
      hasCompletedYear12?: boolean;
      operativeFrom?: string;
      operativeTo?: string;
    } = {}
  ): Promise<PayRate[]> {
    try {
      const { isAdult = false, hasCompletedYear12 = false } = options;
      
      // Get the classifications for this award to find the reference classification
      const classifications = await this.getAwardClassifications(awardCode);
      
      // Different awards use different reference classifications for apprentice percentages
      let referenceClassLevel: string | undefined;
      
      // Use award-specific logic to determine reference classification
      if (awardCode === 'MA000025') { // Electrical Award
        // Clause 16.4(a)(ii) specifies Electrical worker grade 5 as reference
        const referenceClass = classifications.find(c => 
          c.name.toLowerCase().includes('electrical worker grade 5')
        );
        if (referenceClass) {
          referenceClassLevel = referenceClass.fair_work_level_code;
        }
      } else if (awardCode === 'MA000036') { // Plumbing Award
        // For plumbing, use Plumbing and Mechanical Services Tradesperson / Level 1
        const referenceClass = classifications.find(c => 
          c.name.toLowerCase().includes('plumbing and mechanical services tradesperson') ||
          c.name.toLowerCase().includes('level 1')
        );
        if (referenceClass) {
          referenceClassLevel = referenceClass.fair_work_level_code;
        }
      } else if (awardCode === 'MA000003') { // Building and Construction Award
        // Use Level 3 - CW/ECW 3 for Building and Construction
        const referenceClass = classifications.find(c => 
          c.name.toLowerCase().includes('cw/ecw 3') ||
          c.name.toLowerCase().includes('level 3')
        );
        if (referenceClass) {
          referenceClassLevel = referenceClass.fair_work_level_code;
        }
      }
      
      if (!referenceClassLevel) {
        throw new Error(`Could not find reference classification for award ${awardCode}`);
      }
      
      // Get the reference pay rate
      const referenceRates = await this.getPayRates(awardCode, { 
        employeeRateTypeCode: 'ST', // Standard rate
        classificationLevel: parseInt(referenceClassLevel)
      });
      
      if (!referenceRates.length) {
        throw new Error('Reference classification rates not found');
      }
      
      // Sort by most recent effective date and take the first one
      const referenceRate = referenceRates.sort((a, b) => {
        return new Date(b.effective_from).getTime() - new Date(a.effective_from).getTime();
      })[0];
      
      // Calculate percentage based on award rules
      let percentage = 0;
      
      // If no specific apprenticeYear provided, we'll create rates for all years
      const yearsToCalculate = apprenticeYear ? [apprenticeYear] : [1, 2, 3, 4];
      
      // Create an array to hold results for all years
      const calculatedRates: PayRate[] = [];
      
      // Get percentages from award-specific rules
      for (const year of yearsToCalculate) {
        if (awardCode === 'MA000025') { // Electrical Award MA000025
          // Based on clause 16.4(a)(ii) for junior apprentices and 16.4(b)(ii) for adult apprentices
          // Updated with 2024/2025 FY exact percentages based on provided rates
          
          if (isAdult) {
            // Adult apprentice percentages from 16.4(b)(ii)
            // Updated based on the reference data provided
            switch (year) {
              case 1: percentage = 0.80; break; // $23.91/hr 
              case 2: percentage = 0.885; break; // $26.42/hr
              case 3: percentage = 0.885; break; // $26.42/hr
              case 4: percentage = 0.885; break; // $26.42/hr
              default: percentage = 0.80; // Default to 80%
            }
          } else {
            // Junior apprentice percentages from 16.4(a)(ii)
            // Updated based on the reference data provided
            if (hasCompletedYear12) {
              switch (year) {
                case 1: percentage = 0.55; break; // $16.62/hr (55% of base)
                case 2: percentage = 0.65; break; // $19.53/hr (65% of base) 
                case 3: percentage = 0.70; break; // $20.99/hr (70% of base)
                case 4: percentage = 0.82; break; // $24.49/hr (82% of base)
                default: percentage = 0.55; // Default
              }
            } else {
              switch (year) {
                case 1: percentage = 0.50; break; // $15.16/hr (50% of base)
                case 2: percentage = 0.60; break; // $18.08/hr (60% of base)
                case 3: percentage = 0.70; break; // $20.99/hr (70% of base)
                case 4: percentage = 0.82; break; // $24.49/hr (82% of base)
                default: percentage = 0.50; // Default
              }
            }
          }
        } else {
          // Generic percentages for other awards (adapt as needed)
          switch (year) {
            case 1: percentage = 0.50; break; // 50%
            case 2: percentage = 0.60; break; // 60%
            case 3: percentage = 0.70; break; // 70%
            case 4: percentage = 0.90; break; // 90%
            default: percentage = 0.50; // Default
          }
        }
        
        // Calculate the hourly rate based on the percentage
        const hourlyRate = referenceRate.hourly_rate * percentage;
        
        // Create a PayRate object for this year
        calculatedRates.push({
          id: `calculated-apprentice-${awardCode}-year${year}`,
          classification_id: referenceRate.classification_id,
          hourly_rate: parseFloat(hourlyRate.toFixed(2)),
          effective_from: referenceRate.effective_from,
          effective_to: referenceRate.effective_to,
          is_apprentice_rate: true,
          apprenticeship_year: year,
          rate_description: `${year}${this.getOrdinalSuffix(year)} Year Apprentice`,
          base_classification: `Based on ${referenceRate.rate_description || 'Reference Classification'}`,
          base_percentage: percentage * 100
        });
      }
      
      return calculatedRates;
    } catch (error) {
      logger.error('Failed to calculate apprentice rates by reference', { error, awardCode });
      return [];
    }
  }

  /**
   * Helper function to get ordinal suffix for a number
   */
  private getOrdinalSuffix(num: number): string {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  }

  async getEffectiveClassificationRate(
    awardCode: string,
    classificationFixedId: number,
    effectiveDate: string, // YYYY-MM-DD
    preferredRateType: string = 'Adult'
  ): Promise<PayRate | null> {
    try {
      const rates = await this.getPayRates(awardCode, {
        classificationFixedId,
        operativeFrom: effectiveDate,
        operativeTo: effectiveDate
      });

      const activeRates = rates.filter(rate => {
        const fromDate = new Date(rate.effective_from);
        const effDate = new Date(effectiveDate);
        // Ensure effective_to is handled correctly if null (meaning ongoing)
        const toDate = rate.effective_to ? new Date(rate.effective_to) : null;

        return fromDate <= effDate && (!toDate || toDate >= effDate);
      });

      if (activeRates.length === 0) {
        logger.info(`No active rates found for ${awardCode} / CFID ${classificationFixedId} on ${effectiveDate}`);
        return null;
      }

      let selectedRate: PayRate | undefined;

      if (preferredRateType) {
        selectedRate = activeRates.find(r => r.employeeRateTypeCode === preferredRateType);
      }

      if (!selectedRate) {
        // Fallback logic: if preferred not found, or not specified.
        // Prioritize non-apprentice if preferredRateType isn't 'AP' or similar.
        if (preferredRateType && !preferredRateType.toUpperCase().startsWith('AP')) {
            selectedRate = activeRates.find(r => r.employeeRateTypeCode && !r.employeeRateTypeCode.toUpperCase().startsWith('AP'));
        }
        if (!selectedRate && activeRates.length > 0) {
             // If still no specific match, take the first available active rate as a general fallback
            selectedRate = activeRates[0];
            logger.info(`No rate found for preferred type '${preferredRateType}', selected first available: ${selectedRate.employeeRateTypeCode}`);
        }
      }

      // If multiple rates of the selected type are active (e.g. two 'Adult' rates), pick latest effective_from
      if (selectedRate) {
        const sameTypeRates = activeRates.filter(r => r.employeeRateTypeCode === selectedRate?.employeeRateTypeCode);
        if (sameTypeRates.length > 1) {
            selectedRate = sameTypeRates.sort((a, b) => new Date(b.effective_from).getTime() - new Date(a.effective_from).getTime())[0];
            logger.warn(`Multiple active rates of type ${selectedRate?.employeeRateTypeCode} found for ${awardCode} / CFID ${classificationFixedId} on ${effectiveDate}. Selected the one with latest effective_from: ${selectedRate?.effective_from}`);
        }
      }

      return selectedRate || null;

    } catch (error) {
      logger.error(`Error in getEffectiveClassificationRate for ${awardCode} / CFID ${classificationFixedId} on ${effectiveDate}:`, error);
      return null;
    }
  }

  async getEffectiveAwardAllowance(
    awardCode: string,
    allowanceIdentifier: string | number, // Can be ID (number) or code/name (string)
    effectiveDate: string // YYYY-MM-DD
  ): Promise<AllowanceWithValue | null> {
    try {
      // FWA API for allowances might not filter by date in query, so get all and filter client-side.
      const allAllowances = await this.getWageAllowances(awardCode);

      const activeAllowances = allAllowances.filter(allowance => {
        const fromDate = new Date(allowance.effective_from);
        const effDate = new Date(effectiveDate);
        const toDate = allowance.effective_to ? new Date(allowance.effective_to) : null;
        return fromDate <= effDate && (!toDate || toDate >= effDate);
      });

      if (activeAllowances.length === 0) {
        logger.info(`No active allowances found for award ${awardCode} on ${effectiveDate} matching identifier '${allowanceIdentifier}'`);
        return null;
      }

      let foundAllowance: AllowanceWithValue | undefined;
      const identifierStr = allowanceIdentifier.toString().toLowerCase();

      if (typeof allowanceIdentifier === 'number') {
        foundAllowance = activeAllowances.find(a => a.allowanceFixedId === allowanceIdentifier);
      } else {
        // Prioritize matching by code first, then by name/description
        foundAllowance = activeAllowances.find(a => a.code && a.code.toLowerCase() === identifierStr);
        if (!foundAllowance) {
          foundAllowance = activeAllowances.find(a => a.name.toLowerCase().includes(identifierStr));
        }
      }

      // If multiple matches by name (e.g. by partial name), prefer one with latest effective_from.
      if (foundAllowance && typeof allowanceIdentifier === 'string' && !foundAllowance.code) { // implies it was a name match
          const potentialMatchesByName = activeAllowances.filter(a => a.name.toLowerCase().includes(identifierStr));
          if (potentialMatchesByName.length > 1) {
              logger.warn(`Multiple allowances match name/description '${allowanceIdentifier}' for award ${awardCode} on ${effectiveDate}. Selecting one with latest effective_from.`);
              foundAllowance = potentialMatchesByName.sort((a,b) => new Date(b.effective_from).getTime() - new Date(a.effective_from).getTime())[0];
          } else if (potentialMatchesByName.length === 1) {
              foundAllowance = potentialMatchesByName[0];
          }
      }

      return foundAllowance || null;

    } catch (error) {
      logger.error(`Error in getEffectiveAwardAllowance for ${awardCode} / ${allowanceIdentifier} on ${effectiveDate}:`, error);
      return null;
    }
  }
}
