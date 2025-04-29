export interface DashboardError extends Error {
  code?: string;
  details?: unknown;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export function isValidDateRange(range: DateRange): boolean {
  return range.start <= range.end;
}
