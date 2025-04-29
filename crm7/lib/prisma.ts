import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/utils/logger';

declare global {
  const prisma: PrismaClient | undefined;
}

interface PrismaLogEvent {
  query?: string;
  params?: unknown;
  duration?: number;
  target?: string;
  message?: string;
}

class PrismaClientSingleton {
  private static instance: PrismaClient | undefined;

  public static getInstance(): PrismaClient {
    if (!PrismaClientSingleton.instance) {
      PrismaClientSingleton.instance = new PrismaClient({
        log: [
          { level: 'query', emit: 'event' },
          { level: 'error', emit: 'event' },
          { level: 'warn', emit: 'event' },
          { level: 'info', emit: 'event' },
        ],
      });

      // Log queries in development
      if (process.env.NODE_ENV === 'development') {
        PrismaClientSingleton.instance.$on('query', (e: unknown): void => {
          const event = e as PrismaLogEvent;
          logger.debug('Prisma Query', {
            query: event.query,
            params: event.params,
            duration: event.duration ? `${event.duration}ms` : undefined,
          });
        });
      }

      // Log all errors
      PrismaClientSingleton.instance.$on('error', (e: unknown): void => {
        const event = e as PrismaLogEvent;
        logger.error('Prisma Error', {
          target: event.target,
          message: event.message,
        });
      });

      // Log all warnings
      PrismaClientSingleton.instance.$on('warn', (e: unknown): void => {
        const event = e as PrismaLogEvent;
        logger.warn('Prisma Warning', {
          target: event.target,
          message: event.message,
        });
      });
    }

    return PrismaClientSingleton.instance;
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? PrismaClientSingleton.getInstance();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
