import { format, isValid, parse, formatDistanceToNow, parseISO, differenceInDays, addDays, subDays, isAfter, isBefore, isEqual } from 'date-fns';

/**
 * Date formats for consistency throughout the application
 */
export const DATE_FORMATS = {
  /** Day and month */
  dayMonth: 'd MMM',
  /** Day, month, and year */
  dayMonthYear: 'd MMM yyyy',
  /** Full date with day of week */
  fullDate: 'EEEE, d MMMM yyyy',
  /** Short date (numeric) */
  shortDate: 'dd/MM/yyyy',
  /** Australian date format */
  australianDate: 'dd/MM/yyyy',
  /** ISO date format */
  isoDate: 'yyyy-MM-dd',
  /** Display time */
  time: 'h:mm a',
  /** Display date and time */
  dateTime: 'd MMM yyyy, h:mm a',
  /** File name friendly date time format */
  fileNameDateTime: 'yyyy-MM-dd_HH-mm-ss',
  /** Month and year */
  monthYear: 'MMMM yyyy',
};

/**
 * Parse a date string with a given format
 */
export function parseDate(dateString: string, formatString: string = DATE_FORMATS.isoDate): Date | null {
  try {
    const parsedDate = parse(dateString, formatString, new Date());
    return isValid(parsedDate) ? parsedDate : null;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
}

/**
 * Parse an ISO date string (YYYY-MM-DD)
 */
export function parseISODate(dateString: string): Date | null {
  try {
    const parsedDate = parseISO(dateString);
    return isValid(parsedDate) ? parsedDate : null;
  } catch (error) {
    console.error('Error parsing ISO date:', error);
    return null;
  }
}

/**
 * Format a date with the specified format
 */
export function formatDate(date: Date | string | number | null | undefined, formatString: string = DATE_FORMATS.dayMonthYear): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (!isValid(dateObj)) return '';
    
    return format(dateObj, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * Format distance to the date in words (e.g. "2 days ago")
 */
export function formatRelativeDate(date: Date | string | number | null | undefined, addSuffix: boolean = true): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (!isValid(dateObj)) return '';
    
    return formatDistanceToNow(dateObj, { addSuffix });
  } catch (error) {
    console.error('Error formatting relative date:', error);
    return '';
  }
}

/**
 * Get a human-readable date range string
 */
export function formatDateRange(
  startDate: Date | string | null | undefined,
  endDate: Date | string | null | undefined,
  formatString: string = DATE_FORMATS.dayMonthYear
): string {
  if (!startDate) return '';
  
  try {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    
    if (!endDate) {
      return formatDate(start, formatString);
    }
    
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    
    if (!isValid(start) || !isValid(end)) return '';
    
    // Same day - return single date
    if (format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd')) {
      return formatDate(start, formatString);
    }
    
    // Same month and year - return range with single month/year
    if (format(start, 'MM yyyy') === format(end, 'MM yyyy')) {
      return `${format(start, 'd')} - ${format(end, formatString)}`;
    }
    
    // Different months or years - return full range
    return `${formatDate(start, formatString)} - ${formatDate(end, formatString)}`;
  } catch (error) {
    console.error('Error formatting date range:', error);
    return '';
  }
}

/**
 * Calculate the number of days between two dates
 */
export function daysBetween(
  startDate: Date | string | null | undefined,
  endDate: Date | string | null | undefined
): number {
  if (!startDate || !endDate) return 0;
  
  try {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    
    if (!isValid(start) || !isValid(end)) return 0;
    
    return Math.abs(differenceInDays(end, start));
  } catch (error) {
    console.error('Error calculating days between dates:', error);
    return 0;
  }
}

/**
 * Check if a date is in the past
 */
export function isPastDate(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (!isValid(dateObj)) return false;
    
    return isBefore(dateObj, new Date());
  } catch (error) {
    console.error('Error checking if date is in past:', error);
    return false;
  }
}

/**
 * Check if a date is in the future
 */
export function isFutureDate(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (!isValid(dateObj)) return false;
    
    return isAfter(dateObj, new Date());
  } catch (error) {
    console.error('Error checking if date is in future:', error);
    return false;
  }
}

/**
 * Check if date is between two dates (inclusive)
 */
export function isDateBetween(
  date: Date | string | null | undefined,
  startDate: Date | string | null | undefined,
  endDate: Date | string | null | undefined
): boolean {
  if (!date || !startDate || !endDate) return false;
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    
    if (!isValid(dateObj) || !isValid(start) || !isValid(end)) return false;
    
    return (
      (isAfter(dateObj, start) || isEqual(dateObj, start)) && 
      (isBefore(dateObj, end) || isEqual(dateObj, end))
    );
  } catch (error) {
    console.error('Error checking if date is between:', error);
    return false;
  }
}

/**
 * Get today's date at midnight (start of day)
 */
export function getToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Add days to a date
 */
export function addDaysToDate(date: Date | string, days: number): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return addDays(dateObj, days);
}

/**
 * Subtract days from a date
 */
export function subtractDaysFromDate(date: Date | string, days: number): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return subDays(dateObj, days);
}