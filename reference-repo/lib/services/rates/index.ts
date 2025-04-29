import { logger } from '@/lib/utils/logger';
import type { FairWorkService } from '@/lib/services/fairwork/index';
import { RateManagementService } from './rate-management-service';
import {
  RateError,
  RateTemplateStatus,
  type BulkCalculation,
  type BulkCalculationParams,
  type RateAnalytics,
  type RateCalculation,
  type RateEmployee,
  type RateTemplate,
  type RateTemplateHistory,
  type RatesService,
} from './types';

export class RateServiceImpl implements RatesService {
  private rateManagementService: RateManagementService;

  constructor(fairWorkService: FairWorkService) {
    this.rateManagementService = new RateManagementService(fairWorkService);
  }

  async getTemplates({ org_id }: { org_id: string }): Promise<{ data: RateTemplate[] }> {
    try {
      const templates = await this.rateManagementService.getRateTemplates(org_id);
      return { data: templates };
    } catch (error) {
      logger.error('Failed to get templates', { error, org_id });
      throw new RateError('Failed to get templates', { cause: error });
    }
  }

  async getRateTemplate(id: string): Promise<RateTemplate> {
    try {
      const template = await this.rateManagementService.getRateTemplate(id);
      if (!template) {
        throw new RateError(`Template ${id} not found`);
      }
      return template;
    } catch (error) {
      logger.error('Failed to get template', { error, id });
      throw error instanceof RateError
        ? error
        : new RateError('Failed to get template', { cause: error });
    }
  }

  async createRateTemplate(template: Partial<RateTemplate>): Promise<RateTemplate> {
    try {
      return await this.rateManagementService.createRateTemplate(template);
    } catch (error) {
      logger.error('Failed to create template', { error });
      throw new RateError('Failed to create template', { cause: error });
    }
  }

  async updateRateTemplate(id: string, template: Partial<RateTemplate>): Promise<RateTemplate> {
    try {
      return await this.rateManagementService.updateRateTemplate(id, template);
    } catch (error) {
      logger.error('Failed to update template', { error, id });
      throw new RateError('Failed to update template', { cause: error });
    }
  }

  async updateRateTemplateStatus(
    id: string,
    status: RateTemplateStatus,
    updatedBy: string
  ): Promise<void> {
    try {
      await this.rateManagementService.updateRateTemplateStatus(id, status, updatedBy);
    } catch (error) {
      logger.error('Failed to update template status', { error, id });
      throw new RateError('Failed to update template status', { cause: error });
    }
  }

  async deleteRateTemplate(id: string): Promise<void> {
    try {
      await this.rateManagementService.deleteRateTemplate(id);
    } catch (error) {
      logger.error('Failed to delete template', { error, id });
      throw new RateError('Failed to delete template', { cause: error });
    }
  }

  async getRateTemplateHistory(id: string): Promise<{ data: RateTemplateHistory[] }> {
    try {
      const history = await this.rateManagementService.getRateTemplateHistory(id);
      return { data: history };
    } catch (error) {
      logger.error('Failed to get template history', { error, id });
      throw new RateError('Failed to get template history', { cause: error });
    }
  }

  async getRateCalculations(id: string): Promise<{ data: RateCalculation[] }> {
    try {
      const calculations = await this.rateManagementService.getRateCalculations(id);
      return { data: calculations };
    } catch (error) {
      logger.error('Failed to get rate calculations', { error, id });
      throw new RateError('Failed to get rate calculations', { cause: error });
    }
  }

  async validateRateTemplate(template: RateTemplate): Promise<boolean> {
    try {
      const result = await this.rateManagementService.validateRateTemplate(template);
      return result.isValid;
    } catch (error) {
      logger.error('Failed to validate template', { error });
      throw new RateError('Failed to validate template', { cause: error });
    }
  }

  async calculateRate(template: RateTemplate): Promise<number> {
    try {
      const result = await this.rateManagementService.calculateRate(template);
      return result.rate;
    } catch (error) {
      logger.error('Failed to calculate rate', { error });
      throw new RateError('Failed to calculate rate', { cause: error });
    }
  }

  async getBulkCalculations(orgId: string): Promise<{ data: BulkCalculation[] }> {
    try {
      const calculations = await this.rateManagementService.getBulkCalculations(orgId);
      return { data: calculations };
    } catch (error) {
      logger.error('Failed to get bulk calculations', { error, orgId });
      throw new RateError('Failed to get bulk calculations', { cause: error });
    }
  }

  async createBulkCalculation(params: BulkCalculationParams): Promise<{ data: BulkCalculation }> {
    try {
      const result = await this.rateManagementService.createBulkCalculation(params);
      return { data: result };
    } catch (error) {
      logger.error('Failed to create bulk calculation', { error });
      throw new RateError('Failed to create bulk calculation', { cause: error });
    }
  }

  async getAnalytics({ orgId }: { orgId: string }): Promise<RateAnalytics> {
    try {
      const response = await this.rateManagementService.getAnalytics(orgId);
      return response.data;
    } catch (error) {
      logger.error('Failed to get analytics', { error, orgId });
      throw new RateError('Failed to get analytics', { cause: error });
    }
  }

  async getEmployees(): Promise<{ data: RateEmployee[] }> {
    try {
      // Simulate async operation with Promise.resolve
      const employees = await Promise.resolve([]);
      return { data: employees };
    } catch (error) {
      logger.error('Failed to get employees', { error });
      throw new RateError('Failed to get employees', { cause: error });
    }
  }
}

export {
  RateError,
  RateTemplateStatus,
  type BulkCalculation,
  type RateAnalytics,
  type RateCalculation,
  type RateEmployee,
  type RateTemplate,
  type RateTemplateHistory,
  type RatesService
};
