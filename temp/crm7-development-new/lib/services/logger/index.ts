type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
}

interface LoggerService {
  createLogger(namespace: string): Logger;
}

class ConsoleLogger implements Logger {
  private namespace: string;

  constructor(namespace: string) {
    this.namespace = namespace;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] [${this.namespace}] ${message}${contextStr}`;
  }

  private logError(error: Error | string, context?: Record<string, unknown>) {
    console.error('[ERROR]', error, context);
    this.captureError(error, context);
  }

  private logWarning(message: string, context?: Record<string, unknown>) {
    console.warn('[WARN]', message, context);
    this.captureWarning(message, context);
  }

  private captureError(_error: Error | string, _context?: Record<string, unknown>) {
    // Implement error capturing logic here
  }

  private captureWarning(_message: string, _context?: Record<string, unknown>) {
    // Implement warning capturing logic here
  }

  debug(message: string, context?: LogContext): void {
    this.logMessage('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.logMessage('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.logWarning(message, context);
  }

  error(message: string, context?: LogContext): void {
    this.logError(message, context);
  }

  private logMessage(level: LogLevel, message: string, context?: LogContext) {
    const formattedMessage = this.formatMessage(level, message, context);
    // Implement logging logic here
  }
}

export const logger: LoggerService = {
  createLogger: (namespace: string): Logger => new ConsoleLogger(namespace),
};

export type { LogContext, Logger, LoggerService };
