import { logger } from './index';
import { nanoid } from 'nanoid';
import { serializeError } from '../errors/serializer';
import { NextResponse } from 'next/server';

/**
 * Request-scoped logger helper.
 * Captures request context safely without logging PII.
 * Perfect for injecting into API routes.
 */
export function createRequestLogger(req: Request) {
  const correlationId = nanoid();
  // Vercel populates 'x-forwarded-for' automatically
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const method = req.method;
  
  // Clean URL to avoid logging query parameters that might contain sensitive data
  let url = req.url;
  try {
    const parsedUrl = new URL(req.url);
    url = parsedUrl.pathname;
  } catch {
    // Keep raw URL if parsing fails, but this is unlikely
  }

  const requestLogger = logger.child({
    correlationId,
    req: { method, url, ip },
  });

  return {
    logger: requestLogger,
    correlationId,
    ip,
    
    /**
     * Centralized API Error Response helper.
     * Safely serializes errors and returns a compliant NextResponse.
     */
    handleApiError: (err: unknown) => {
      const serialized = serializeError(err, correlationId);
      
      // Do not log raw errors or leak stack traces to the client response.
      // We pass the raw error strictly to the internal Pino logger.
      if (serialized.statusCode >= 500) {
        requestLogger.error({ err, ...serialized.payload }, 'Internal Server Error');
      } else if (serialized.statusCode === 429) {
        requestLogger.warn({ ...serialized.payload }, 'Rate Limit Exceeded');
      } else {
        requestLogger.info({ ...serialized.payload }, 'Client Error');
      }

      return NextResponse.json(serialized.payload, { status: serialized.statusCode });
    }
  };
}

/**
 * Audit-safe event logging helpers.
 * Ensures consistent structured logging shapes for core product events.
 */
export const auditEventLogger = {
  success: (auditId: string, totalSavingsMonthly: number, useCase: string) => {
    logger.info({ auditId, totalSavingsMonthly, useCase }, 'Audit saved successfully');
  },
  leadCaptured: (auditId: string, highValue: boolean, notifyOnly: boolean) => {
    logger.info({ auditId, highValue, notifyOnly }, 'Lead captured');
  },
  rateLimitTriggered: (ip: string) => {
    logger.info({ ip }, 'Rate limit triggered');
  },
  honeypotTriggered: (ip: string) => {
    logger.info({ ip }, 'Honeypot triggered - discarding submission');
  }
};

/**
 * External-service observability helpers.
 * Useful for tracking Anthropic, DB, and Resend operational metrics.
 */
export const externalServiceLogger = {
  anthropicCallStart: (auditId: string, model: string) => {
    logger.debug({ auditId, model }, 'Anthropic API called');
  },
  anthropicCallSuccess: (auditId: string, durationMs: number) => {
    logger.info({ auditId, durationMs }, 'Anthropic API call succeeded');
  },
  anthropicCallFailed: (auditId: string, errorReason: string, durationMs: number) => {
    logger.warn({ auditId, errorReason, durationMs }, 'Anthropic API failed');
  },
  emailSendFailed: (auditId: string, errorReason: string) => {
    logger.error({ auditId, errorReason }, 'Email send failed');
  },
  dbQueryFailed: (operation: string, errorReason: string) => {
    logger.error({ operation, errorReason }, 'DB query failed');
  }
};
