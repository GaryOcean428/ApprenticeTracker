import { type PrismaClient } from '@prisma/client';
import { logger, type Logger } from '@/lib/utils/logger';
import { type MetricsService } from '@/lib/utils/metrics';

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
