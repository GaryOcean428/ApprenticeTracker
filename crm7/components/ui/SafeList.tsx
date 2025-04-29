import { type ReactElement } from 'react';

interface SafeListProps<T> {
  items: T[];
  renderItem: (item: T) => ReactElement;
  emptyMessage?: string;
}

export function SafeList<T>({ 
  items, 
  renderItem, 
  emptyMessage = 'No items to display'
}: SafeListProps<T>): JSX.Element {
  if (!items.length) {
    return <p className="text-gray-500">{emptyMessage}</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={index}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}
