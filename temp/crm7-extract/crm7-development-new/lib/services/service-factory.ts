import { logger } from '@/lib/logger';
import type { IBaseService } from '@/lib/utils/service';

export class ServiceFactory {
  private static instance: ServiceFactory;
  private services: Map<string, IBaseService> = new Map();

  private constructor() {}

  public static getInstance(): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory();
    }
    return ServiceFactory.instance;
  }

  public registerService<T extends IBaseService>(
    ServiceClass: new (...args: any[]) => T,
    serviceName: string,
    ...args: any[]
  ): T {
    const existingService = this.services.get(serviceName);
    if (existingService) {
      logger.warn('Service already registered', { serviceName });
      return existingService as T;
    }

    const service = new ServiceClass(...args);
    this.services.set(serviceName, service);
    logger.info('Service registered', { serviceName });
    return service;
  }

  public getService<T extends IBaseService>(serviceName: string): T | undefined {
    const service = this.services.get(serviceName);
    if (!service) {
      logger.warn('Service not found', { serviceName });
      return undefined;
    }
    return service as T;
  }

  public getAllServices(): Map<string, IBaseService> {
    return new Map(this.services);
  }

  public resetAllMetrics(): void {
    for (const service of this.services.values()) {
      service.resetMetrics();
    }
    logger.info('All service metrics reset');
  }

  public getAllMetrics(): Record<string, unknown> {
    const metrics: Record<string, unknown> = {};
    for (const [name, service] of this.services.entries()) {
      metrics[name] = service.getMetrics();
    }
    return metrics;
  }
}
