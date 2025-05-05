export function safeMap<T, U>(
  items: T[] | null | undefined,
  mapFn: (item: T, index: number) => U
): U[] {
  if (!items) {
    return [];
  }
  return items.map(mapFn);
}
