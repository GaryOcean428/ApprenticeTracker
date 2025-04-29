import { env } from '@/env.mjs';
import { DatabaseError } from '@/types/supabase';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  userId?: string;
  orgId?: string;
  requestId?: string;
  [key: string]: unknown;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: Error | DatabaseError;
  timestamp: string;
}

export interface Logger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
  createLogger(name: string): Logger;
}

class LoggerImpl implements Logger {
  private static instance: LoggerImpl;
  private logLevel: LogLevel = 'info';

  private constructor() {}

  static getInstance(): LoggerImpl {
    if (!LoggerImpl.instance) {
      LoggerImpl.instance = new LoggerImpl();
    }
    return LoggerImpl.instance;
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    return levels[level] >= levels[this.logLevel];
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = new Date().toISOString();
    const context = entry.context ? ` | context: ${JSON.stringify(entry.context)}` : '';
    const error = entry.error ? ` | error: ${JSON.stringify(entry.error)}` : '';
    return `[${timestamp}] ${entry.level.toUpperCase()}: ${entry.message}${context}${error}`;
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog('debug')) {
      const entry: LogEntry = {
        level: 'debug',
        message,
        context,
        timestamp: new Date().toISOString()
      };
      console.debug(this.formatMessage(entry));
    }
  }

  info(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog('info')) {
      const entry: LogEntry = {
        level: 'info',
        message,
        context,
        timestamp: new Date().toISOString()
      };
      console.info(this.formatMessage(entry));
    }
  }

  warn(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog('warn')) {
      const entry: LogEntry = {
        level: 'warn',
        message,
        context,
        timestamp: new Date().toISOString()
      };
      console.warn(this.formatMessage(entry));
    }
  }

  error(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog('error')) {
      const entry: LogEntry = {
        level: 'error',
        message,
        context,
        timestamp: new Date().toISOString()
      };
      console.error(this.formatMessage(entry));
    }
  }

  createLogger(name: string): Logger {
    return new LoggerImpl();
  }
}

export const logger: Logger = LoggerImpl.getInstance();
