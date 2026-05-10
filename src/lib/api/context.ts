import { createRequestLogger } from '../logger/utils';
import { extractClientIp, generateRequestFingerprint, enforcePayloadSizeLimit } from '../security';

export interface ApiContext {
  /** The native Request object */
  req: Request;
  /** Safely extracted client IP (proxy-aware) */
  ip: string;
  /** Hashed IP + UserAgent for privacy-safe abuse detection */
  fingerprint: string;
  /** Unique request ID for distributed tracing */
  correlationId: string;
  /** Request-scoped Pino logger instance */
  logger: ReturnType<typeof createRequestLogger>['logger'];
}

/**
 * Bootstraps the execution context for an API route.
 * Aggregates metadata, binds loggers, and runs earliest security guards.
 */
export function createApiContext(req: Request): {
  context: ApiContext;
  handleApiError: (err: unknown) => Response;
} {
  // Initialize scoped logger and error handler first so we can trap early errors
  const { logger, correlationId, handleApiError, ip } = createRequestLogger(req);
  
  // Early security guard: enforce max payload size limits in O(1) time
  enforcePayloadSizeLimit(req);
  
  const fingerprint = generateRequestFingerprint(req);

  return {
    context: { req, ip, fingerprint, correlationId, logger },
    handleApiError,
  };
}
