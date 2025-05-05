/**
 * Simple logger utility for application logging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogData {
  [key: string]: any;
}

interface Logger {
  debug(message: string, data?: LogData): void;
  info(message: string, data?: LogData): void;
  warn(message: string, data?: LogData): void;
  error(message: string, data?: LogData): void;
}

class ConsoleLogger implements Logger {
  private logLevel: number;
  private readonly levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };

  constructor(level: LogLevel = 'info') {
    this.logLevel = this.levels[level];
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levels[level] >= this.logLevel;
  }

  private formatData(data?: LogData): string {
    if (!data) return '';
    try {
      return JSON.stringify(data, null, 2);
    } catch (error) {
      return `[Unserializable data: ${error}]`;
    }
  }

  debug(message: string, data?: LogData): void {
    if (this.shouldLog('debug')) {
      console.debug(`[DEBUG] ${message}${data ? '\n' + this.formatData(data) : ''}`);
    }
  }

  info(message: string, data?: LogData): void {
    if (this.shouldLog('info')) {
      console.info(`[INFO] ${message}${data ? '\n' + this.formatData(data) : ''}`);
    }
  }

  warn(message: string, data?: LogData): void {
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] ${message}${data ? '\n' + this.formatData(data) : ''}`);
    }
  }

  error(message: string, data?: LogData): void {
    if (this.shouldLog('error')) {
      console.error(`[ERROR] ${message}${data ? '\n' + this.formatData(data) : ''}`);
    }
  }
}

// Create a singleton logger instance
const logger = new ConsoleLogger(process.env.NODE_ENV === 'production' ? 'info' : 'debug');

export default logger;