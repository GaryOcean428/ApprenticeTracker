import type { BankTransaction, BankAccount, PaymentRequest } from '@/lib/types/bank';

declare module '@/lib/hooks/use-bank-integration' {
  export interface BankIntegrationHook {
    accounts: QueryResult<BankAccount[]>;
    transactions: QueryResult<BankTransaction[]>;
    isLoading: boolean;
    error: Error | null;
    createBankAccount: (
      account: Omit<BankAccount, 'id' | 'created_at' | 'updated_at'>,
    ) => Promise<BankAccount>;
    createPayment: (
      payment: Omit<PaymentRequest, 'id' | 'created_at' | 'updated_at'>,
    ) => Promise<PaymentRequest>;
    isCreatingBankAccount: boolean;
    isCreatingPayment: boolean;
    refreshData?: () => Promise<void>;
  }

  export function useBankIntegration(): BankIntegrationHook;
}
