import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { handleApiError } from '@/lib/api-error';
import { useState } from 'react';

interface BulkOperationsProps<T> {
  items: T[];
  selectedItems: Set<string>;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onItemSelect: (id: string) => void;
  operations: {
    label: string;
    action: (ids: string[]) => Promise<void>;
    variant?: 'default' | 'destructive' | 'outline';
  }[];
  getItemId: (item: T) => string;
  renderItem: (item: T) => React.ReactNode;
}

export function BulkOperations<T>({
  items,
  selectedItems,
  onSelectAll,
  onDeselectAll,
  onItemSelect,
  operations,
  getItemId,
  renderItem,
}: BulkOperationsProps<T>) {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleOperation = async (action: (ids: string[]) => Promise<void>) => {
    if (selectedItems.size === 0) return;

    try {
      setProcessing(true);
      setProgress(0);

      const selectedIds = Array.from(selectedItems);
      const batchSize = 10;

      for (let i = 0; i < selectedIds.length; i += batchSize) {
        const batch = selectedIds.slice(i, i + batchSize);
        await action(batch);
        setProgress(((i + batchSize) / selectedIds.length) * 100);
      }

      onDeselectAll();
    } catch (error) {
      const { message } = handleApiError(error);
      // You might want to show this error in a toast notification
      console.error(message);
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  const allSelected = items.length > 0 && selectedItems.size === items.length;
  const someSelected = selectedItems.size > 0 && selectedItems.size < items.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="select-all"
            checked={allSelected}
            indeterminate={someSelected}
            onCheckedChange={() => {
              if (allSelected) {
                onDeselectAll();
              } else {
                onSelectAll();
              }
            }}
            disabled={processing}
            aria-label="Select all items"
          />
          <label htmlFor="select-all" className="text-sm">
            {selectedItems.size} selected
          </label>
        </div>

        <div className="flex items-center space-x-2">
          {operations.map((op, index) => (
            <Button
              key={index}
              variant={op.variant || 'default'}
              onClick={() => handleOperation(op.action)}
              disabled={selectedItems.size === 0 || processing}
            >
              {op.label}
            </Button>
          ))}
        </div>
      </div>

      {processing && (
        <Progress value={progress} className="w-full" />
      )}

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={getItemId(item)}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50"
          >
            <Checkbox
              checked={selectedItems.has(getItemId(item))}
              onCheckedChange={() => onItemSelect(getItemId(item))}
              disabled={processing}
              aria-label={`Select item ${getItemId(item)}`}
            />
            {renderItem(item)}
          </div>
        ))}
      </div>
    </div>
  );
}
