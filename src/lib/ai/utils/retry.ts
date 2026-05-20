import { logger } from '../../logger';

/**
 * Executes an async operation with bounded exponential backoff and timeout.
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number,
  timeoutMs: number,
  operationName: string = 'async_operation'
): Promise<T> {
  let attempt = 0;
  
  while (attempt <= maxRetries) {
    try {
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), timeoutMs);
      
      // We wrap the operation to support abort signals manually if needed, 
      // but standard Promise.race with an abort error works for generic async functions.
      const timeoutPromise = new Promise<never>((_, reject) => {
        abortController.signal.addEventListener('abort', () => {
          reject(new Error('Operation timed out'));
        });
      });

      const result = await Promise.race([
        operation(),
        timeoutPromise
      ]);
      
      clearTimeout(timeoutId);
      return result as T;
      
    } catch (error) {
      attempt++;
      
      const isTimeout = error instanceof Error && error.message === 'Operation timed out';
      const reason = error instanceof Error ? error.message : String(error);
      
      if (attempt > maxRetries) {
        logger.error({ operationName, attempt, maxRetries, reason }, 'Operation failed permanently');
        throw error;
      }

      logger.warn({ operationName, attempt, reason }, 'Operation failed, retrying');
      
      // Exponential backoff: 500ms, 1000ms, 2000ms...
      const backoffMs = Math.min(500 * Math.pow(2, attempt - 1), 5000);
      await new Promise(resolve => setTimeout(resolve, backoffMs));
    }
  }
  
  throw new Error('Unreachable code block in withRetry');
}
