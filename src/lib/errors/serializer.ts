import { AppError } from './AppError';
import { nanoid } from 'nanoid';

export interface ApiErrorResponse {
  error: string;
  code: string;
  details?: unknown;
  correlationId: string;
}

/**
 * Serializes any error into a safe, client-facing format.
 * Never leaks stack traces. Returns deterministic shape.
 */
export function serializeError(err: unknown, providedCorrelationId?: string): {
  payload: ApiErrorResponse;
  statusCode: number;
} {
  const correlationId = providedCorrelationId ?? nanoid();

  if (err instanceof AppError) {
    return {
      payload: {
        error: err.message,
        code: err.code,
        // Only expose details for validation errors to prevent leaking internal state
        ...(err.code === 'VALIDATION_ERROR' && err.details ? { details: err.details } : {}),
        correlationId,
      },
      statusCode: err.statusCode,
    };
  }

  // Handle standard Error instances or unknown objects safely
  const message = err instanceof Error ? err.message : 'An unexpected error occurred';
  
  return {
    payload: {
      error: 'Something went wrong. Please try again.',
      code: 'INTERNAL_SERVER_ERROR',
      correlationId,
    },
    statusCode: 500,
  };
}
