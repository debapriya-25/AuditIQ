import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error('DATABASE_URL is missing in environment variables.');
}

// For serverless environments: we disable local connection pooling via { prepare: false }
// because Supabase provides its own PgBouncer connection pooler natively at the connection string level.
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
