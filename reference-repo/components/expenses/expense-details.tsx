import { type Expense } from '@/types/expenses';

interface ExpenseDetailsProps {
  expense: Expense;
}

export function ExpenseDetails({ expense }: ExpenseDetailsProps): JSX.Element {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-medium">{expense.description}</h3>
          <p className="text-sm text-gray-500">{expense.category}</p>
        </div>
        <div>
          <p className="text-lg font-semibold">${expense.amount.toFixed(2)}</p>
          <p className="text-sm text-gray-500">{expense.date}</p>
        </div>
      </div>
    </div>
  );
}
