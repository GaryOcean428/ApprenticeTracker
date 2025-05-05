import { type PrismaClient } from '@prisma/client';
import { logger, type Logger } from './logger';
import { type MetricsService } from './metrics';

export interface ServiceOptions {
  prisma?: PrismaClient;
  metrics?: MetricsService;
  enableMetrics?: boolean;
}

export interface IBaseService {
  getMetrics(): Record<string, unknown> | null;
  resetMetrics(): void;
}

export abstract class BaseService implements IBaseService {
  protected readonly name: string;
  protected readonly version: string;
  protected readonly enableMetrics: boolean;
  protected readonly prisma?: PrismaClient;
  protected readonly metrics?: MetricsService;
  protected readonly logger: Logger;

  constructor(name: string, version: string, options: ServiceOptions = {}) {
    this.name = name;
    this.version = version;
    this.enableMetrics = options.enableMetrics ?? true;
    this.prisma = options.prisma;
    this.metrics = options.metrics;
    this.logger = logger.createLogger(name);
  }

  protected async executeServiceMethod<T>(
    methodName: string,
    method: () => Promise<T>
  ): Promise<T> {
    try {
      return await method();
    } catch (error) {
      this.logger.error(`${this.name}.${methodName} error:`, {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  public getMetrics(): Record<string, unknown> | null {
    if (!this.enableMetrics) return null;
    return {
      serviceName: this.name,
      version: this.version,
      timestamp: new Date().toISOString()
    };
  }

  public resetMetrics(): void {
    // Default implementation is no-op
  }
}

export async function executeServiceMethod<T>(
  methodName: string,
  fn: () => Promise<T>,
  context?: Record<string, unknown>
): Promise<T> {
  const startTime = Date.now();
  const logContext = { methodName, ...context };

  try {
    const result = await fn();
    const duration = Date.now() - startTime;

    console.debug(`Service method completed successfully`, {
      ...logContext,
      duration,
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error(`Service method failed`, {
      ...logContext,
      duration,
      error: errorMessage,
    });

    throw error;
  }
}
