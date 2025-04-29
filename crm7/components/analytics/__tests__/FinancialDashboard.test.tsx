import type { PostgrestError } from '@supabase/supabase-js';
import { render, screen } from '@testing-library/react';
import { vi, type Mock } from 'vitest';

import { useBankIntegration } from '@/lib/hooks/use-bank-integration';
import type { Database } from '@/types/supabase';

import { FinancialDashboard } from '@/components/analytics/financial-dashboard';

const mockTransactions: Database['public']['Tables']['bank_transactions']['Row'][] = [
  {
    id: '1',
    org_id: 'org1',
    account_id: 'acc1',
    transaction_type: 'credit',
    amount: 100,
    description: 'Test transaction',
    reference: 'ref1',
    status: 'completed',
    metadata: null,
    created_at: '2025-01-20T00:00:00Z',
    updated_at: '2025-01-20T00:00:00Z',
  },
];

const mockBankAccounts: Database['public']['Tables']['bank_accounts']['Row'][] = [
  {
    id: '1',
    org_id: 'org1',
    account_name: 'Test Account',
    account_number: '123456',
    bsb: '000-000',
    bank_name: 'Test Bank',
    is_active: true,
    metadata: null,
    created_at: '2025-01-20T00:00:00Z',
    updated_at: '2025-01-20T00:00:00Z',
  },
];

vi.mock('@/lib/hooks/use-bank-integration', () => ({
  useBankIntegration: () => ({
    transactions: {
      data: mockTransactions,
      error: null,
      isLoading: false,
    },
    accounts: {
      data: mockBankAccounts,
      error: null,
      isLoading: false,
    },
    createBankAccount: vi.fn().mockResolvedValue(undefined),
    createPayment: vi.fn().mockResolvedValue(undefined),
    refreshData: vi.fn().mockResolvedValue(undefined),
  }),
}));

describe('FinancialDashboard', () => {
  it('renders without crashing', () => {
    render(<FinancialDashboard />);
    expect(screen.getByText('Financial Overview')).toBeInTheDocument();
  });

  it('displays error state for transactions', () => {
    (vi.mocked(useBankIntegration) as Mock).mockReturnValueOnce({
      transactions: {
        data: undefined,
        error: { message: 'Failed to load transactions' } as PostgrestError,
        isLoading: false,
      },
      accounts: {
        data: mockBankAccounts,
        error: null,
        isLoading: false,
      },
      createBankAccount: vi.fn().mockResolvedValue(undefined),
      createPayment: vi.fn().mockResolvedValue(undefined),
      refreshData: vi.fn().mockResolvedValue(undefined),
    });

    render(<FinancialDashboard />);
    expect(screen.getByText('Failed to load transactions')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    (vi.mocked(useBankIntegration) as Mock).mockReturnValueOnce({
      transactions: {
        data: undefined,
        error: null,
        isLoading: true,
      },
      accounts: {
        data: undefined,
        error: null,
        isLoading: true,
      },
      createBankAccount: vi.fn().mockResolvedValue(undefined),
      createPayment: vi.fn().mockResolvedValue(undefined),
      refreshData: vi.fn().mockResolvedValue(undefined),
      isLoading: false,
    });

    render(<FinancialDashboard />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
