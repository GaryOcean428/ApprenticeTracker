import { format, parseISO } from 'date-fns';

export function formatDate(date: string | Date, formatString: string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatString);
}
