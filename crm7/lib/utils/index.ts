import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function safeMap<T, U>(
  items: T[] | null | undefined,
  fn: (item: T, index: number) => U
): U[] {
  if (!items) return [];
  return items.map(fn);
}

// Other utility functions as needed…
