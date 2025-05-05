import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EnhancedRateServiceImpl } from '../enhanced-service';
import { createConfiguredRateService } from '../config';

// Mock dependencies
vi.mock('@/lib/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

const mockFairWorkService = {
  validateRate: vi.fn().mockResolvedValue({
    isValid: true,
    minimumRate: 25.5,
    messages: []
  })
};

describe('EnhancedRateServiceImpl', () => {
  let enhancedService: EnhancedRateServiceImpl;
  
  beforeEach(() => {
    vi.resetAllMocks();
    enhancedService = new EnhancedRateServiceImpl(mockFairWorkService as any, {
      enableAwardValidation: true,
      enableMonitoring: true
    });
    
    // Mock internal methods
    enhancedService.getRateTemplate = vi.fn().mockImplementation((id) => 
      Promise.resolve({
        id,
        name: `Template ${id}`,
        baseRate: 30.0,
        baseMargin: 20,
        superRate: 10.5,
        leaveLoading: 8.33,
        workersCompRate: 3.5,
        payrollTaxRate: 5.0,
        trainingCostRate: 1.0,
        otherCostsRate: 2.0,
        casualLoading: 25,
        effectiveFrom: '2025-01-01T00:00:00Z',
        status: 'active',
        metadata: {
          awardCode: 'MA000004',
          levelCode: 'L1',
          employmentType: 'casual'
        },
        version: 1
      })
    );
    
    enhancedService.getTemplates = vi.fn().mockResolvedValue({
      data: [
        {
          id: 'template-1',
          name: 'Template 1',
          baseRate: 28.0,
          status: 'active',
          version: 1
        },
        {
          id: 'template-2',
          name: 'Template 2',
          baseRate: 32.0,
          status: 'draft',
          version: 1
        }
      ]
    });
    
    enhancedService.getAnalytics = vi.fn().mockResolvedValue({
      totalTemplates: 2,
      activeTemplates: 1,
      averageRate: 30.0,
      recentChanges: [
        { action: 'created', timestamp: '2025-04-20T12:00:00Z' }
      ]
    });
    
    enhancedService.getRateTemplateHistory = vi.fn().mockResolvedValue({
      data: [{
        id: 'history-1',
        templateId: 'template-1',
        version: 1,
        changes: { baseRate: 25.0 }
      }]
    });
  });
  
  it('should create an instance through the configuration factory', () => {
    const service = createConfiguredRateService(mockFairWorkService as any, {
      useEnhancedService: true,
      enableAwardValidation: true
    });
    
    expect(service).toBeInstanceOf(EnhancedRateServiceImpl);
  });
  
  it('should compare templates and identify differences', async () => {
    const result = await enhancedService.compareTemplates('template-1', 'template-2');
    
    expect(result).toBeDefined();
    expect(result.baseTemplateId).toBe('template-1');
    expect(result.compareTemplateId).toBe('template-2');
    expect(result.differences).toBeInstanceOf(Array);
    expect(result.summary).toBeDefined();
  });
  
  it('should validate template compliance', async () => {
    const result = await enhancedService.validateTemplateCompliance('template-1');
    
    expect(result).toBeDefined();
    expect(result.isValid).toBe(true);
    expect(result.complianceStatus).toBeDefined();
    expect(result.additionalChecks).toBeInstanceOf(Array);
  });
  
  it('should get suggested rates based on criteria', async () => {
    const result = await enhancedService.getSuggestedRates({
      industry: 'hospitality',
      role: 'bartender'
    });
    
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('awardCode');
    expect(result[0]).toHaveProperty('suggestedRate');
  });
  
  it('should get enhanced analytics', async () => {
    const result = await enhancedService.getEnhancedAnalytics({ orgId: 'org-1' });
    
    expect(result).toBeDefined();
    expect(result.totalTemplates).toBe(2);
    expect(result.rateDistribution).toBeDefined();
    expect(result.complianceMetrics).toBeDefined();
    expect(result.templatesByStatus).toBeDefined();
    expect(result.changeFrequency).toBeDefined();
  });
  
  it('should start a bulk validation operation', async () => {
    const result = await enhancedService.bulkValidate(['template-1', 'template-2']);
    
    expect(result).toBeDefined();
    expect(result.operationId).toBeDefined();
    expect(result.status).toBe('pending');
    expect(result.progress.total).toBe(2);
    expect(result.progress.inProgress).toBe(2);
  });
  
  it('should get bulk operation status', async () => {
    // First start an operation
    const startResult = await enhancedService.bulkValidate(['template-1']);
    const { operationId } = startResult;
    
    // Then get its status
    const result = await enhancedService.getBulkOperationStatus(operationId);
    
    expect(result).toBeDefined();
    expect(result.operationId).toBe(operationId);
    expect(result.status).toBeDefined();
    expect(result.progress).toBeDefined();
  });
  
  it('should get service health', async () => {
    const health = await enhancedService.getServiceHealth();
    
    expect(health).toBeDefined();
    expect(health.status).toBeDefined();
    expect(health.responseTime).toBeDefined();
    expect(health.metrics).toBeDefined();
  });
  
  it('should restore a previous template version', async () => {
    const result = await enhancedService.restoreVersion('template-1', 1);
    
    expect(result).toBeDefined();
  });
});
