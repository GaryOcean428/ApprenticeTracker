export interface BillingRate {
  id: string;
  orgId: string;
  name: string;
  type: 'hourly' | 'daily' | 'fixed';
  amount: number;
  currency: string;
  effectiveFrom: string;
  effectiveTo?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface BillingCharge {
  id: string;
  orgId: string;
  rateId: string;
  amount: number;
  currency: string;
  date: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface BillingCalculation {
  baseAmount: number;
  adjustments: {
    type: string;
    amount: number;
    description?: string;
  }[];
  totalAmount: number;
  currency: string;
}
