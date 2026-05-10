import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Lazy-initialized DB singleton.
// Connection is deferred to first call — not module load time —
// so the app can start, build, and type-check without DATABASE_URL set.
let _db: PostgresJsDatabase<typeof schema> | null = null;

export function getDb(): PostgresJsDatabase<typeof schema> {
  if (_db) return _db;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is missing in environment variables. ' +
      'Set it in .env.local before calling any database operation.'
    );
  }

  // For serverless environments: we disable local connection pooling via { prepare: false }
  // because Supabase provides its own PgBouncer connection pooler natively at the connection string level.
  const client = postgres(connectionString, { prepare: false });
  _db = drizzle(client, { schema });
  return _db;
}
