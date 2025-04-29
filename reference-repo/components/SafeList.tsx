import * as React from 'react';
import { safeMap } from '@/lib/utils/safe-map';

interface SafeListProps<T> {
  items: T[] | null | undefined;
  renderItem: (item: T, index: number) => React.ReactNode;
}

export function SafeList<T>({ items, renderItem }: SafeListProps<T>): React.ReactElement {
  const mappedItems = safeMap(items, renderItem);
  return <>{mappedItems}</>;
}
