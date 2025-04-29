import winston from 'winston';

interface LogMetadata {
  [key: string]: unknown;
}

type LogMessage = string | Error;

interface TypedLogger {
  error: (message: LogMessage, meta?: LogMetadata) => void;
  warn: (message: LogMessage, meta?: LogMetadata) => void;
  info: (message: LogMessage, meta?: LogMetadata) => void;
  debug: (message: LogMessage, meta?: LogMetadata) => void;
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  ],
});

const typedLogger: TypedLogger = {
  error: (message: LogMessage, meta?: LogMetadata) => {
    if (message instanceof Error) {
      logger.error(message.message, {
        ...meta,
        error: { message: message.message, stack: message.stack },
      });
    } else {
      logger.error(message, meta);
    }
  },
  warn: (message: LogMessage, meta?: LogMetadata) => {
    if (message instanceof Error) {
      logger.warn(message.message, {
        ...meta,
        error: { message: message.message, stack: message.stack },
      });
    } else {
      logger.warn(message, meta);
    }
  },
  info: (message: LogMessage, meta?: LogMetadata) => {
    if (message instanceof Error) {
      logger.info(message.message, {
        ...meta,
        error: { message: message.message, stack: message.stack },
      });
    } else {
      logger.info(message, meta);
    }
  },
  debug: (message: LogMessage, meta?: LogMetadata) => {
    if (message instanceof Error) {
      logger.debug(message.message, {
        ...meta,
        error: { message: message.message, stack: message.stack },
      });
    } else {
      logger.debug(message, meta);
    }
  },
};

const loggerModule = {
  info: (message: string, ...args: unknown[]): void => {
    console.log(message, ...args);
  },
  warn: (message: string, ...args: unknown[]): void => {
    console.warn(message, ...args);
  },
  error: (message: string, ...args: unknown[]): void => {
    console.error(message, ...args);
  }
};

export { typedLogger, loggerModule };
