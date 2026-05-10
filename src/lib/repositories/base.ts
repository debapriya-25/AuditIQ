import { DatabaseError } from '../errors/AppError';
import { externalServiceLogger } from '../logger/utils';

/**
 * Standardized Database Error Wrapper.
 * Captures any Drizzle/Postgres error, logs it securely using Pino, 
 * and throws a generic DatabaseError.
 * 
 * This ensures that:
 * 1. ORM internals (like SQL syntax errors or column names) NEVER leak to the frontend.
 * 2. All database failures are recorded consistently for observability.
 */
export async function withDbCatch<T>(operation: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    const errorReason = err instanceof Error ? err.message : 'Unknown DB error';
    
    // Securely log the failure without leaking sensitive user data from the query itself
    externalServiceLogger.dbQueryFailed(operation, errorReason);
    
    throw new DatabaseError(`Database operation failed: ${operation}`);
  }
}
