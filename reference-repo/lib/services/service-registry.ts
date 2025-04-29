import { logger } from '@/lib/utils/logger';
import type { ServiceFactory } from './service-factory';
import type { IBaseService } from '@/lib/utils/service';

interface ServiceRegistration {
  name: string;
  dependencies: string[];
}

export class ServiceRegistry {
  private static instance: ServiceRegistry;
  private services = new Map<string, IBaseService>();
  private registrations = new Map<string, ServiceRegistration>();
  private factory: ServiceFactory;

  constructor(factory: ServiceFactory) {
    this.factory = factory;
  }

  public static getInstance(factory: ServiceFactory): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry(factory);
    }
    return ServiceRegistry.instance;
  }

  register(name: string, dependencies: string[] = []): void {
    this.registrations.set(name, { name, dependencies });
  }

  async initialize(): Promise<void> {
    const initialized = new Set<string>();
    const initializing = new Set<string>();

    const initializeService = (name: string): void => {
      if (initialized.has(name)) {
        return;
      }
      if (initializing.has(name)) {
        throw new Error(`Circular dependency detected: ${name}`);
      }
      const registration = this.registrations.get(name);
      if (!registration) {
        throw new Error(`Service not registered: ${name}`);
      }
      initializing.add(name);
      for (const dep of registration.dependencies) {
        initializeService(dep);
      }

      try {
        this.getService(name);
      } catch (error) {
        logger.error(`Failed to initialize service: ${name}`, {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        });
        throw error;
      }
      initializing.delete(name);
      initialized.add(name);
    };

    for (const name of this.registrations.keys()) {
      initializeService(name);
    }
  }

  getService<T extends IBaseService>(name: string): T {
    const service = this.factory.getService<T>(name);
    if (!service) {
      throw new Error(`Service ${name} not found`);
    }
    return service;
  }

  validateDependencies(): void {
    for (const registration of this.registrations.values()) {
      for (const dep of registration.dependencies) {
        if (!this.registrations.has(dep)) {
          throw new Error(
            `Invalid dependency: ${registration.name} depends on unregistered service ${dep}`,
          );
        }
      }
    }
  }

  getInitializationOrder(): string[] {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const order: string[] = [];

    const visit = (name: string): void => {
      if (visited.has(name)) {
        return;
      }
      if (visiting.has(name)) {
        throw new Error(`Circular dependency detected: ${name}`);
      }
      visiting.add(name);
      const registration = this.registrations.get(name);
      if (registration != null) {
        for (const dep of registration.dependencies) {
          visit(dep);
        }
      }
      visiting.delete(name);
      visited.add(name);
      order.push(name);
    };

    for (const name of this.registrations.keys()) {
      visit(name);
    }
    return order;
  }
}
