export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  [key: string]: unknown;
}

export interface Logger {
  log(level: LogLevel, message: string, context?: LogContext, error?: Error): void;
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, error?: Error, context?: LogContext): void;
}

class LoggerImpl implements Logger {
  private static instance: LoggerImpl;
  private constructor() {}

  static getInstance(): LoggerImpl {
    if (!LoggerImpl.instance) {
      LoggerImpl.instance = new LoggerImpl();
    }
    return LoggerImpl.instance;
  }

  log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...(context && { context }),
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      }),
    };

    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console[level](JSON.stringify(logEntry, null, 2));
    }

    // In production, we could send to a logging service
    if (process.env.NODE_ENV === 'production') {
      // Implementation for production logging
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.log('error', message, context, error);
  }

  createLogger(component: string): Logger {
    const logger = new LoggerImpl();
    const componentContext = { component };

    return {
      log: (level: LogLevel, message: string, context?: LogContext, error?: Error) => {
        this.log(level, message, { ...componentContext, ...context }, error);
      },
      debug: (message: string, context?: LogContext) => {
        this.debug(message, { ...componentContext, ...context });
      },
      info: (message: string, context?: LogContext) => {
        this.info(message, { ...componentContext, ...context });
      },
      warn: (message: string, context?: LogContext) => {
        this.warn(message, { ...componentContext, ...context });
      },
      error: (message: string, error?: Error, context?: LogContext) => {
        this.error(message, error, { ...componentContext, ...context });
      },
    };
  }
}

export const logger = LoggerImpl.getInstance();
export const createLogger = (component: string): Logger => logger.createLogger(component);
