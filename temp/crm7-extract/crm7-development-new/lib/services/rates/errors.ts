/**
 * Enhanced error handling for the rates service
 * Inspired by atomic-crm's approach to structured error handling
 */

export enum RateErrorCode {
  // Core errors
  UNKNOWN = 'UNKNOWN',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  NOT_FOUND = 'NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  
  // Service-specific errors
  TEMPLATE_INVALID = 'TEMPLATE_INVALID',
  CALCULATION_FAILED = 'CALCULATION_FAILED',
  INVALID_STATUS_TRANSITION = 'INVALID_STATUS_TRANSITION',
  RATE_EXPIRED = 'RATE_EXPIRED',
  DATABASE_ERROR = 'DATABASE_ERROR',
  FAIRWORK_SERVICE_ERROR = 'FAIRWORK_SERVICE_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
}

export interface RateErrorOptions {
  code?: RateErrorCode;
  cause?: unknown;
  context?: Record<string, unknown>;
  httpStatus?: number;
}

/**
 * Enhanced error class for Rate Service with structured metadata
 */
export class RateError extends Error {
  public readonly code: RateErrorCode;
  public readonly cause?: unknown;
  public readonly context: Record<string, unknown>;
  public readonly httpStatus: number;
  public readonly timestamp: string;

  constructor(message: string, options: RateErrorOptions = {}) {
    super(message);
    this.name = 'RateError';
    this.code = options.code || RateErrorCode.UNKNOWN;
    this.cause = options.cause;
    this.context = options.context || {};
    this.httpStatus = options.httpStatus || this.getDefaultHttpStatus();
    this.timestamp = new Date().toISOString();
    
    // Capture stack trace correctly
    Error.captureStackTrace(this, RateError);
  }

  /**
   * Map error codes to appropriate HTTP status codes
   */
  private getDefaultHttpStatus(): number {
    switch (this.code) {
    case RateErrorCode.NOT_FOUND:
      return 404;
    case RateErrorCode.PERMISSION_DENIED:
      return 403;
    case RateErrorCode.VALIDATION_FAILED:
    case RateErrorCode.TEMPLATE_INVALID:
      return 400;
    case RateErrorCode.ALREADY_EXISTS:
      return 409;
    case RateErrorCode.RATE_LIMIT_EXCEEDED:
      return 429;
    case RateErrorCode.FAIRWORK_SERVICE_ERROR:
      return 502;
    default:
      return 500;
    }
  }

  /**
   * Convert to a plain object for logging or serialization
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      httpStatus: this.httpStatus,
      context: this.context,
      timestamp: this.timestamp,
      stack: this.stack,
      cause: this.cause instanceof Error 
        ? {
          name: this.cause.name,
          message: this.cause.message,
          stack: this.cause.stack
        }
        : this.cause
    };
  }

  /**
   * Create a NotFound error
   */
  static notFound(message: string, context?: Record<string, unknown>): RateError {
    return new RateError(message, {
      code: RateErrorCode.NOT_FOUND,
      context
    });
  }

  /**
   * Create a ValidationFailed error
   */
  static validationFailed(message: string, context?: Record<string, unknown>): RateError {
    return new RateError(message, {
      code: RateErrorCode.VALIDATION_FAILED,
      context
    });
  }

  /**
   * Create a PermissionDenied error
   */
  static permissionDenied(message: string, context?: Record<string, unknown>): RateError {
    return new RateError(message, {
      code: RateErrorCode.PERMISSION_DENIED,
      context
    });
  }

  /**
   * Create an AlreadyExists error
   */
  static alreadyExists(message: string, context?: Record<string, unknown>): RateError {
    return new RateError(message, {
      code: RateErrorCode.ALREADY_EXISTS,
      context
    });
  }

  /**
   * Create a DatabaseError
   */
  static databaseError(message: string, cause?: unknown): RateError {
    return new RateError(message, {
      code: RateErrorCode.DATABASE_ERROR,
      cause
    });
  }
}
