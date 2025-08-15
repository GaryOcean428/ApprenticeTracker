import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { Pool as PgPool } from 'pg';
import ws from 'ws';
import * as schema from '@shared/schema';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('DATABASE_URL must be set in production environment');
  }
  console.warn('⚠️  DATABASE_URL not set - running in development mode without database');
}

// Check if we're using Neon (serverless) or regular PostgreSQL
let db: ReturnType<typeof drizzle> | ReturnType<typeof drizzlePg> | null = null;
let pool: Pool | PgPool | null = null;

/**
 * Initialize database connection with proper error handling and retry logic
 */
async function initializeDatabase(): Promise<void> {
  if (!databaseUrl) return;

  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds

  if (databaseUrl.includes('neon') || databaseUrl.includes('@ep-')) {
    // Neon Serverless PostgreSQL
    neonConfig.webSocketConstructor = ws;
    pool = new Pool({ connectionString: databaseUrl });
    db = drizzle({ client: pool, schema });
    console.log('✅ Using Neon serverless database');
    return;
  }

  // Regular PostgreSQL (Railway, etc.) with SSL support and retry logic
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const pgPool = new PgPool({
        connectionString: databaseUrl,
        ssl:
          process.env.NODE_ENV === 'production'
            ? {
                rejectUnauthorized: false,
                // Additional SSL options for Railway compatibility
                requestCert: false,
                checkServerIdentity: () => undefined,
              }
            : false,
        // Connection pool settings for better stability
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      });

      // Test the connection synchronously
      await new Promise<void>((resolve, reject) => {
        pgPool.connect((err, client, release) => {
          if (err) {
            reject(err);
          } else {
            console.log(`✅ Database connected successfully (attempt ${attempt})`);
            release();
            resolve();
          }
        });
      });

      pool = pgPool;
      db = drizzlePg(pgPool, { schema });
      return; // Success - exit retry loop
    } catch (error) {
      console.error(`Database connection error (attempt ${attempt}/${maxRetries}):`, error);

      if (attempt === maxRetries) {
        if (process.env.NODE_ENV === 'production') {
          throw new Error(`Failed to connect to database after ${maxRetries} attempts: ${error}`);
        } else {
          console.warn(
            '⚠️  Database connection failed in development - continuing without database'
          );
          return;
        }
      }

      // Wait before retrying
      console.log(`Retrying database connection in ${retryDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
}

// Database cleanup functions
const closePool = async () => {
  if (!pool) return;
  try {
    await new Promise<void>(resolve => {
      // @ts-expect-error end signature differs between pools; both accept callback
      pool.end(() => resolve());
    });
    console.log('Database pool closed');
  } catch (e) {
    console.warn('Error closing database pool:', e);
  }
};

const shutdown = async () => {
  const timeout = setTimeout(() => {
    console.warn('Force exiting after shutdown timeout');
    process.exit(0);
  }, 5000);
  await closePool();
  clearTimeout(timeout);
  process.exit(0);
};

// Setup graceful shutdown handlers
if (databaseUrl) {
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

export { pool, db, initializeDatabase };
