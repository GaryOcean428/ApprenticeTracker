import { type LogLevel } from '@/types/logger';

interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  metadata?: Record<string, unknown>;
}

class Logger {
  private logBuffer: LogEntry[] = [];
  private readonly maxBufferSize = 1000;

  debug(message: string, metadata?: Record<string, unknown>): void {
    this.log('debug', message, metadata);
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    this.log('info', message, metadata);
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    this.log('warn', message, metadata);
  }

  error(message: string, metadata?: Record<string, unknown>): void {
    this.log('error', message, metadata);
  }

  private log(level: LogLevel, message: string, metadata?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      metadata,
    };

    this.logBuffer.push(entry);

    if (this.logBuffer.length > this.maxBufferSize) {
      this.flush();
    }
  }

  flush(): void {
    this.logBuffer.forEach((entry) => {
      const { level, message, metadata } = entry;
      console[level](
        `[${entry.timestamp.toISOString()}] ${level.toUpperCase()}: ${message}${
          metadata ? '\nMetadata: ' + JSON.stringify(metadata, null, 2) : ''
        }\n`
      );
    });
    this.logBuffer = [];
  }

  createLogger(namespace: string): Logger {
    return new Logger();
  }
}

export const logger = new Logger();
