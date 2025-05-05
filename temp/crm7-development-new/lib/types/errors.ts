export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  VALIDATION_ERROR = 'VALIDATION_ERROR'
}

export interface ErrorContext {
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly details?: Record<string, unknown>;

  constructor(context: ErrorContext) {
    super(context.message);
    this.name = 'AppError';
    this.code = context.code;
    this.details = context.details;
  }

  public toJSON(): ErrorContext {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}

export class SupabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SupabaseError';
  }
}
