/**
 * Rate forecast data structure
 */
export interface RateForecast {
  /** Unique identifier for the forecast */
  id: string;
  /** Organization ID the forecast belongs to */
  org_id: string;
  /** Date the forecast is for */
  forecast_date: string;
  /** Forecasted rate value */
  forecast_value: number;
  /** Confidence level of the forecast (0-1) */
  confidence?: number;
  /** Additional forecast metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Rate report data structure
 */
export interface RateReport {
  /** Unique identifier for the report */
  id: string;
  /** Organization ID the report belongs to */
  org_id: string;
  /** Date of the report */
  report_date: string;
  /** Report data including actual rate */
  data: {
    /** Actual rate value */
    actual_rate?: number;
    /** Target rate value */
    target_rate?: number;
    /** Rate variance from target */
    variance?: number;
    /** Additional metrics */
    [key: string]: unknown;
  };
  /** Report status */
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  /** Report type */
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  /** Creation timestamp */
  created_at: string;
  /** Last update timestamp */
  updated_at: string;
}

/**
 * Parameters for fetching rate forecasts
 */
export interface GetForecastsParams {
  /** Organization ID to fetch forecasts for */
  org_id: string;
  /** Start date for forecast range */
  start_date: string;
  /** End date for forecast range */
  end_date: string;
  /** Optional filters */
  filters?: Record<string, unknown>;
}

/**
 * Parameters for fetching rate reports
 */
export interface GetReportsParams {
  /** Organization ID to fetch reports for */
  org_id: string;
  /** Start date for report range */
  start_date: string;
  /** End date for report range */
  end_date: string;
  /** Optional filters */
  filters?: Record<string, unknown>;
}

/**
 * API response structure
 */
export interface ApiResponse<T> {
  /** Response data */
  data: T;
  /** Response metadata */
  meta?: {
    /** Total count of records */
    total?: number;
    /** Current page number */
    page?: number;
    /** Number of records per page */
    per_page?: number;
  };
}
