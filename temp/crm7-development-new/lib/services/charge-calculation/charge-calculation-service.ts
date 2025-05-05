import type { RateTemplate } from '@/lib/services/fairwork/types';
import { BaseService, type ServiceOptions } from '@/lib/utils/service';
import { logger } from '@/lib/utils/logger';

export interface ChargeCalculationService {
  calculateChargeRate(template: RateTemplate, hours: number): Promise<number>;
  calculateBulkChargeRates(templates: RateTemplate[], hours: number): Promise<Map<string, number>>;
  validateChargeRate(template: RateTemplate, hours: number, proposedRate: number): Promise<boolean>;
}

export class ChargeCalculationServiceImpl extends BaseService implements ChargeCalculationService {
  private readonly serviceLogger = logger.createLogger('ChargeCalculationService');

  constructor(options: ServiceOptions = {}) {
    super('ChargeCalculationService', '1.0.0', options);
  }

  async calculateChargeRate(template: RateTemplate, hours: number): Promise<number> {
    return this.executeServiceMethod('calculateChargeRate', async (): Promise<number> => {
      const components = {
        base: template.baseRate * hours,
        margin: template.baseRate * (template.baseMargin / 100) * hours,
        super: template.baseRate * (template.superRate / 100) * hours,
        leave: template.baseRate * (template.leaveLoading / 100) * hours,
        workersComp: template.baseRate * (template.workersCompRate / 100) * hours,
        payrollTax: template.baseRate * (template.payrollTaxRate / 100) * hours,
        training: template.baseRate * (template.trainingCostRate / 100) * hours,
        other: template.baseRate * (template.otherCostsRate / 100) * hours,
        casual: template.baseRate * (template.casualLoading / 100) * hours,
      };

      const totalComponents = Object.values(components).reduce((sum, value) => sum + value, 0);
      const fundingOffset = template.baseRate * (template.fundingOffset / 100) * hours;

      return totalComponents - fundingOffset;
    }) as Promise<number>;
  }

  async calculateBulkChargeRates(templates: RateTemplate[], hours: number): Promise<Map<string, number>> {
    return this.executeServiceMethod('calculateBulkChargeRates', async (): Promise<Map<string, number>> => {
      const results = new Map<string, number>();

      for (const template of templates) {
        const calculation = await this.calculateChargeRate(template, hours);
        results.set(template.id, calculation);
      }

      return results;
    }) as Promise<Map<string, number>>;
  }

  async validateChargeRate(template: RateTemplate, hours: number, proposedRate: number): Promise<boolean> {
    return this.executeServiceMethod('validateChargeRate', async (): Promise<boolean> => {
      const rate = await this.calculateChargeRate(template, hours);
      const tolerance = 0.01; // 1% tolerance for floating point comparison
      const difference = Math.abs(rate - proposedRate);
      const percentageDifference = difference / rate;
      return percentageDifference <= tolerance;
    }) as Promise<boolean>;
  }
}

export const chargeCalculationService = new ChargeCalculationServiceImpl();
