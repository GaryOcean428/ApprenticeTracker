import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { Pool as PgPool } from 'pg';
import ws from 'ws';
import * as schema from '@shared/schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set. Did you forget to provision a database?');
}

const databaseUrl = process.env.DATABASE_URL;

// Check if we're using Neon (serverless) or regular PostgreSQL
let db: ReturnType<typeof drizzle> | ReturnType<typeof drizzlePg>;
let pool: Pool | PgPool;

if (databaseUrl.includes('neon') || databaseUrl.includes('@ep-')) {
  // Neon Serverless PostgreSQL
  neonConfig.webSocketConstructor = ws;
  pool = new Pool({ connectionString: databaseUrl });
  db = drizzle({ client: pool, schema });
} else {
  // Regular PostgreSQL (Railway, etc.) with SSL support
  const pgPool = new PgPool({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false } 
      : false
  });
  
  // Test the connection
  pgPool.connect((err, client, release) => {
    if (err) {
      console.error('Database connection error:', err.stack);
      process.exit(1);
    }
    console.log('✅ Database connected successfully');
    release();
  });

  pool = pgPool;
  db = drizzlePg(pgPool, { schema });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  pool.end(() => {
    console.log('Database pool closed');
  });
});

export { pool, db };
