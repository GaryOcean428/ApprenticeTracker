export interface BankTransaction {
  id: string;
  org_id: string;
  account_id: string;
  transaction_type: 'credit' | 'debit';
  amount: number;
  description: string;
  reference: string;
  status: 'pending' | 'completed' | 'failed';
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  type: 'credit' | 'debit';
  transaction_date: string;
}

export interface BankAccount {
  id: string;
  org_id: string;
  account_name: string;
  account_number: string;
  bsb: string;
  bank_name: string;
  is_active?: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PaymentRequest {
  id: string;
  org_id: string;
  account_id: string;
  amount: number;
  description: string;
  due_date: string;
  status?: 'pending' | 'approved' | 'rejected' | 'completed';
  approver_id?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
