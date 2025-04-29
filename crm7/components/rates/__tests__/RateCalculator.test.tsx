import { useRates } from '@/lib/hooks/use-rates';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RateCalculator } from '../RateCalculator';
import { type RateTemplate } from '@/lib/types/rates';

vi.mock('@/lib/hooks/use-rates');

const mockRateTemplate: RateTemplate = {
  id: '1',
  orgId: 'test-org',
  name: 'Test Template',
  templateType: 'hourly',
  description: 'Test description',
  baseRate: 100,
  baseMargin: 10,
  superRate: 10,
  leaveLoading: 5,
  workersCompRate: 2,
  payrollTaxRate: 3,
  trainingCostRate: 1,
  otherCostsRate: 1,
  fundingOffset: 0,
  casualLoading: 25,
  effectiveFrom: '2022-01-01',
  effectiveTo: null,
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'system',
  updatedBy: 'system',
  version: 1,
};

const mockUseRatesReturn = {
  data: [mockRateTemplate],
  isLoading: false,
  error: null
};

describe('RateCalculator', () => {
  beforeEach(() => {
    vi.mocked(useRates).mockReturnValue(mockUseRatesReturn as any);
  });

  it('renders calculator with templates', () => {
    render(<RateCalculator orgId="test-org" />);
    expect(screen.getByText(/calculate rate/i)).toBeInTheDocument();
  });

  it('handles loading state', () => {
    vi.mocked(useRates).mockReturnValue({
      ...mockUseRatesReturn,
      isLoading: true,
      data: null
    } as any);

    render(<RateCalculator orgId="test-org" />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
