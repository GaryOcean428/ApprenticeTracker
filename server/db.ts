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

if (databaseUrl) {
  if (databaseUrl.includes('neon') || databaseUrl.includes('@ep-')) {
    // Neon Serverless PostgreSQL
    neonConfig.webSocketConstructor = ws;
    pool = new Pool({ connectionString: databaseUrl });
    db = drizzle({ client: pool, schema });
    console.log('✅ Using Neon serverless database');
  } else {
    // Regular PostgreSQL (Railway, etc.) with SSL support
    const pgPool = new PgPool({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    // Test the connection
    pgPool.connect((err, client, release) => {
      if (err) {
        console.error('Database connection error:', err.stack);
        if (process.env.NODE_ENV === 'production') {
          process.exit(1);
        } else {
          console.warn(
            '⚠️  Database connection failed in development - continuing without database'
          );
        }
      } else {
        console.log('✅ Database connected successfully');
        release();
      }
    });

    pool = pgPool;
    db = drizzlePg(pgPool, { schema });
  }

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

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
} else {
  console.log('📝 Running without database connection in development mode');
}

export { pool, db };
