import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { handleApiError } from '@/lib/api-error';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  status: 'pending' | 'completed' | 'failed';
  category?: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  onStatusChange?: (id: string, status: Transaction['status']) => Promise<void>;
}

export function TransactionList({ transactions, onStatusChange }: TransactionListProps) {
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState<string | null>(null);

  const filteredTransactions = transactions.filter((transaction) =>
    transaction.description.toLowerCase().includes(filter.toLowerCase()) ||
    transaction.category?.toLowerCase().includes(filter.toLowerCase())
  );

  const handleStatusUpdate = async (id: string, status: Transaction['status']) => {
    if (!onStatusChange) return;
    
    try {
      setLoading(id);
      await onStatusChange(id, status);
    } catch (error) {
      const { message } = handleApiError(error);
      // You might want to show this error in a toast notification
      console.error(message);
    } finally {
      setLoading(null);
    }
  };

  const formatAmount = (amount: number, type: Transaction['type']) => {
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(amount));
    
    return type === 'debit' ? `-${formattedAmount}` : formattedAmount;
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Filter transactions..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              {onStatusChange && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>{transaction.category || '-'}</TableCell>
                <TableCell className="text-right">
                  <span className={transaction.type === 'debit' ? 'text-red-600' : 'text-green-600'}>
                    {formatAmount(transaction.amount, transaction.type)}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(transaction.status)}>
                    {transaction.status}
                  </Badge>
                </TableCell>
                {onStatusChange && (
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={loading === transaction.id}
                      onClick={() => handleStatusUpdate(
                        transaction.id,
                        transaction.status === 'pending' ? 'completed' : 'pending'
                      )}
                    >
                      {loading === transaction.id ? 'Updating...' : 'Toggle Status'}
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {filteredTransactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={onStatusChange ? 6 : 5} className="text-center text-muted-foreground">
                  No transactions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
