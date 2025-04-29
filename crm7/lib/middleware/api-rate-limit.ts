import { type NextApiRequest, type NextApiResponse } from 'next';
import { env } from '@/lib/config/environment';

interface RateLimitStore {
  value: number;
  lastReset: number;
}

const rateLimitStateMap = new Map<string, RateLimitStore>();

const rateLimiter = {
  init: async (): Promise<void> => {
    rateLimitStateMap.clear();
    return Promise.resolve();
  },

  increment: async (key: string): Promise<RateLimitStore> => {
    const now = Date.now();
    const existingStore = rateLimitStateMap.get(key);

    if (typeof existingStore !== "undefined" && existingStore !== null) {
      // Reset if window has passed
      if (now - existingStore.lastReset >= env.RATE_LIMIT_WINDOW_MS) {
        const currentStore: RateLimitStore = {
          value: 1,
          lastReset: now,
        };
        rateLimitStateMap.set(key, currentStore);
        return currentStore;
      }

      existingStore.value += 1;
      rateLimitStateMap.set(key, existingStore);
      return existingStore;
    }

    const store: RateLimitStore = {
      value: 1,
      lastReset: now,
    };
    rateLimitStateMap.set(key, store);
    return store;
  },

  decrement: async (key: string): Promise<RateLimitStore | undefined> => {
    const store = rateLimitStateMap.get(key);
    if (typeof store !== "undefined" && store !== null) {
      store.value = Math.max(0, store.value - 1);
      rateLimitStateMap.set(key, store);
    }
    return store;
  },

  resetKey: async (key: string): Promise<void> => {
    rateLimitStateMap.delete(key);
    return Promise.resolve();
  },

  resetAll: async (): Promise<void> => {
    rateLimitStateMap.clear();
    return Promise.resolve();
  },
};

export const config = {
  matcher: ['/api/:path*'],
  handler: (_req: NextApiRequest, _res: NextApiResponse): void => {
    // Handler implementation
  },
  skip: (_req: NextApiRequest): boolean => {
    // Skip implementation
    return false;
  },
};

export function withRateLimit(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
): (req: NextApiRequest, res: NextApiResponse) => Promise<void> {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
      await new Promise((resolve, reject): void => {
        const result = rateLimiter.increment(req.url ?? '');
        if (result instanceof Error) {
          reject(result);
        } else {
          resolve(result);
        }
      });

      return handler(req, res);
    } catch (error) {
      console.error('Rate limit error:', error);

      if (error instanceof Error && error.message.includes('rate limit')) {
        return res.status(429).json({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
        });
      }

      throw error;
    }
  };
}
