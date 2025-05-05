import { logger } from '@/lib/logger';
import { ServiceFactory } from '../service-factory';
import { ServiceRegistry } from '../service-registry';
import { cleanupServices, initializeServices } from '../startup';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { Mock } from 'vitest';

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../service-factory', () => ({
  ServiceFactory: {
    getInstance: vi.fn(() => ({
      resetAllMetrics: vi.fn(),
    })),
  },
}));

vi.mock('../service-registry');

describe('Startup Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Process Signal Handlers', () => {
    let processExitSpy: Mock;
    let processOnSpy: Mock;
    let handlers: Record<string, () => Promise<void>> = {};

    beforeEach(() => {
      processExitSpy = vi.spyOn(process, 'exit') as Mock;
      processExitSpy.mockImplementation(() => undefined as never);

      processOnSpy = vi.spyOn(process, 'on') as Mock;
      processOnSpy.mockImplementation((event: string, listener: () => Promise<void>) => {
        handlers[event] = listener;
        return process;
      });
    });

    afterEach(() => {
      processExitSpy.mockRestore();
      processOnSpy.mockRestore();
      handlers = {};
    });

    it('should register process signal handlers', () => {
      vi.resetModules();
      require('../startup');

      expect(processOnSpy).toHaveBeenCalledWith('SIGTERM', expect.any(Function));
      expect(processOnSpy).toHaveBeenCalledWith('SIGINT', expect.any(Function));
    });

    it('should handle SIGTERM signal', async () => {
      vi.resetModules();
      require('../startup');

      const handler = handlers['SIGTERM'];
      expect(handler).toBeDefined();
      await handler();

      expect(logger.info).toHaveBeenCalledWith('SIGTERM received. Starting graceful shutdown...');
      expect(processExitSpy).toHaveBeenCalledWith(0);
    });

    it('should handle SIGINT signal', async () => {
      vi.resetModules();
      require('../startup');

      const handler = handlers['SIGINT'];
      expect(handler).toBeDefined();
      await handler();

      expect(logger.info).toHaveBeenCalledWith('SIGINT received. Starting graceful shutdown...');
      expect(processExitSpy).toHaveBeenCalledWith(0);
    });
  });
});
