import { logger } from '@/lib/logger';
import { ServiceFactory } from './service-factory';
import { ServiceRegistry } from './service-registry';

let isInitialized = false;

export async function initializeServices(): Promise<void> {
  if (typeof isInitialized !== "undefined" && isInitialized !== null) {
    return;
  }

  const factory = ServiceFactory.getInstance();
  const registry = new ServiceRegistry(factory);

  try {
    // Register services
    registry.validateDependencies();
    registry.initialize();
    isInitialized = true;
    logger.info('Application services initialized successfully');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Failed to initialize application services:', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

export async function cleanupServices(): Promise<void> {
  if (!isInitialized) {
    return;
  }

  const factory = ServiceFactory.getInstance();

  try {
    // Reset metrics and perform cleanup
    factory.resetAllMetrics();

    // Additional cleanup tasks can be added here

    isInitialized = false;
    logger.info('Application services cleaned up successfully');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Failed to cleanup application services:', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

// Handle process termination
process.on('SIGTERM', (): void => {
  logger.info('SIGTERM received. Starting graceful shutdown...');
  void cleanupServices().finally((): never => process.exit(0));
});

process.on('SIGINT', (): void => {
  logger.info('SIGINT received. Starting graceful shutdown...');
  void cleanupServices().finally((): never => process.exit(0));
});
