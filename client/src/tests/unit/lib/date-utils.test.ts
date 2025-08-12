import { vi } from 'vitest';
import {
  formatDate,
  parseDate,
  formatRelativeDate,
  parseISODate,
  DATE_FORMATS,
} from '../../../lib/date-utils';

describe('Date Utilities', () => {
  describe('parseDate', () => {
    it('parses a valid date string with default format', () => {
      const result = parseDate('2023-05-15');
      expect(result instanceof Date).toBe(true);
      expect(result?.getFullYear()).toBe(2023);
      expect(result?.getMonth()).toBe(4); // 0-based month index (May = 4)
      expect(result?.getDate()).toBe(15);
    });

    it('parses a valid date with custom format', () => {
      const result = parseDate('15/05/2023', DATE_FORMATS.australianDate);
      expect(result instanceof Date).toBe(true);
      expect(result?.getFullYear()).toBe(2023);
      expect(result?.getMonth()).toBe(4);
      expect(result?.getDate()).toBe(15);
    });

    it('returns null for invalid date strings', () => {
      expect(parseDate('not-a-date')).toBeNull();
      expect(parseDate('2023-13-45')).toBeNull(); // Invalid month/day
    });
  });

  describe('parseISODate', () => {
    it('parses a valid ISO date string', () => {
      const result = parseISODate('2023-05-15');
      expect(result instanceof Date).toBe(true);
      expect(result?.getFullYear()).toBe(2023);
      expect(result?.getMonth()).toBe(4);
      expect(result?.getDate()).toBe(15);
    });

    it('returns null for invalid ISO date strings', () => {
      expect(parseISODate('not-a-date')).toBeNull();
    });
  });

  describe('formatDate', () => {
    it('formats a Date object with default format', () => {
      const date = new Date(2023, 4, 15); // May 15, 2023
      expect(formatDate(date)).toBe('15 May 2023');
    });

    it('formats a date string', () => {
      expect(formatDate('2023-05-15')).toBe('15 May 2023');
    });

    it('formats with custom format', () => {
      const date = new Date(2023, 4, 15);
      expect(formatDate(date, DATE_FORMATS.shortDate)).toBe('15/05/2023');
      expect(formatDate(date, DATE_FORMATS.isoDate)).toBe('2023-05-15');
      expect(formatDate(date, DATE_FORMATS.monthYear)).toBe('May 2023');
    });

    it('returns empty string for null/undefined input', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
    });

    it('returns empty string for invalid dates', () => {
      expect(formatDate('not-a-date')).toBe('');
      expect(formatDate(new Date('invalid'))).toBe('');
    });
  });

  describe('formatRelativeDate', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2023-05-15T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('formats date relative to now', () => {
      expect(formatRelativeDate(new Date('2023-05-14T12:00:00Z'))).toBe('1 day ago');
      expect(formatRelativeDate(new Date('2023-05-10T12:00:00Z'))).toBe('5 days ago');
      expect(formatRelativeDate(new Date('2023-05-16T12:00:00Z'))).toBe('in 1 day');

      // Without suffix
      expect(formatRelativeDate(new Date('2023-05-14T12:00:00Z'), false)).toBe('1 day');
    });

    it('returns empty string for null/undefined/invalid input', () => {
      expect(formatRelativeDate(null)).toBe('');
      expect(formatRelativeDate(undefined)).toBe('');
      expect(formatRelativeDate('not-a-date')).toBe('');
    });
  });
});
