export function safeMap<T, U>(
  items: T[] | null | undefined,
  callback: (item: T, index: number) => U,
): U[] {
  if (!items || !Array.isArray(items)) {
    return [];
  }
  return items.map(callback);
}
