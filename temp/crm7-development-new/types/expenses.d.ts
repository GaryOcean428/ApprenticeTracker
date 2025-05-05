export interface Expense {
  id: string;
  amount: number;
  description: string;
  date?: string;
  category?: string;
  status?: string;
}
