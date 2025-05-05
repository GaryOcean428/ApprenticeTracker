/**
 * Integration with FairWork API for rate validation
 * Enhances the rates service with award compliance capabilities
 */
import { logger } from '@/lib/utils/logger';
import type { FairWorkService } from '@/lib/services/fairwork/index';
import type { RateTemplate } from './types';
import { RateError, RateErrorCode } from './errors';

export interface AwardRateValidationResult {
  isValid: boolean;
  minimumRate: number;
  awardCode: string;
  levelCode: string;
  difference: number;
  messages?: string[];
}

export interface AwardRateSuggestion {
  awardCode: string;
  levelCode: string;
  suggestedRate: number;
  description: string;
}

/**
 * Service for validating rates against FairWork award rates
 */
export class AwardRateValidator {
  constructor(private readonly fairWorkService: FairWorkService) {}

  /**
   * Validate a rate template against FairWork award rates
   * @param template Rate template to validate
   * @returns Validation result
   */
  async validateRateAgainstAward(
    template: RateTemplate
  ): Promise<AwardRateValidationResult> {
    try {
      // Extract relevant data from template
      const { templateType, baseRate } = template;
      
      // In a real implementation, we would extract more data such as:
      // - Award code (classification)
      // - Level code
      // - Employment type (casual, part-time, full-time)
      // - Age (for juniors)
      // - Other relevant factors
      
      // Call FairWork service to validate
      const validationResponse = await this.fairWorkService.validateRate({
        rate: baseRate,
        awardCode: template.metadata?.awardCode as string || 'MA000004', // Default to Hospitality award
        levelCode: template.metadata?.levelCode as string || 'L1',
        employmentType: template.metadata?.employmentType as string || 'casual',
        // Add other parameters as needed
      });

      // Process response
      return {
        isValid: validationResponse.isValid,
        minimumRate: validationResponse.minimumRate,
        awardCode: template.metadata?.awardCode as string || 'MA000004',
        levelCode: template.metadata?.levelCode as string || 'L1',
        difference: baseRate - validationResponse.minimumRate,
        messages: validationResponse.messages
      };
    } catch (error) {
      logger.error('Failed to validate rate against award', { error });
      throw new RateError('Failed to validate rate against award', {
        code: RateErrorCode.FAIRWORK_SERVICE_ERROR,
        cause: error
      });
    }
  }

  /**
   * Get suggested rates based on template criteria
   * @param criteria Search criteria for rates
   */
  async getSuggestedRates(criteria: {
    industry?: string;
    role?: string;
    experience?: string;
  }): Promise<AwardRateSuggestion[]> {
    try {
      // In a real implementation, we would call FairWork service 
      // with proper criteria mapping
      const { industry, role, experience } = criteria;
      
      // Mock implementation - this would be replaced with actual API call
      const suggestions = [
        {
          awardCode: 'MA000004',
          levelCode: 'L1',
          suggestedRate: 25.5,
          description: 'Level 1 Food and Beverage Attendant'
        },
        {
          awardCode: 'MA000004',
          levelCode: 'L2',
          suggestedRate: 28.5,
          description: 'Level 2 Food and Beverage Attendant'
        },
        {
          awardCode: 'MA000004',
          levelCode: 'L3',
          suggestedRate: 32.0,
          description: 'Level 3 Food and Beverage Attendant'
        }
      ];
      
      return suggestions;
    } catch (error) {
      logger.error('Failed to get suggested rates', { error, criteria });
      throw new RateError('Failed to get suggested rates', {
        code: RateErrorCode.FAIRWORK_SERVICE_ERROR,
        cause: error
      });
    }
  }
}
