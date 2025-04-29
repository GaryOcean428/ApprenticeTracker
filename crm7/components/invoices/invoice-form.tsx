import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { type LineItem } from '@/lib/types/invoice';

interface InvoiceFormData {
  dueDate: Date;
  items: Array<{
    description: string;
    amount: number;
  }>;
}

interface InvoiceFormProps {
  onSubmit: (data: InvoiceFormData) => void;
  initialData?: InvoiceFormData;
}

export function InvoiceForm({ onSubmit }: InvoiceFormProps): React.ReactElement {
  const [formData, setFormData] = useState<InvoiceFormData>({
    dueDate: new Date(),
    items: [],
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Failed to submit invoice:', error);
    }
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number): void => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const addLineItem = (): void => {
    setFormData({ ...formData, items: [...formData.items, { description: '', amount: 0 }] });
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label>Due Date</label>
            <div>{formData.dueDate ? format(formData.dueDate, 'PPP') : 'Select date'}</div>
          </div>

          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={index} className="grid gap-4 grid-cols-3">
                <input
                  type="text"
                  value={item.description}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
                    updateLineItem(index, 'description', e.target.value)
                  }
                  placeholder="Description"
                />
                <input
                  type="number"
                  value={item.amount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
                    updateLineItem(index, 'amount', parseFloat(e.target.value))
                  }
                  placeholder="Amount"
                />
              </div>
            ))}
          </div>

          <Button type="button" onClick={addLineItem}>
            Add Line Item
          </Button>

          <Button type="submit">Create Invoice</Button>
        </div>
      </form>
    </div>
  );
}
