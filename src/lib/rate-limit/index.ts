import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '../redis/client';

/**
 * Creates a reusable rate limiter for different API routes.
 * Utilizes Upstash Redis and a sliding window algorithm for robust rate limiting.
 * 
 * @param requests - Maximum number of requests allowed within the window
 * @param window - Time window string (e.g., '1 m', '10 s', '1 h')
 * @param prefix - Redis key prefix for this specific limiter
 */
export const createRateLimiter = (
  requests: number,
  window: Parameters<typeof Ratelimit.slidingWindow>[1],
  prefix: string = 'rate-limit'
) => {
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
    prefix,
  });
};

/**
 * Rate limiter specifically configured for the audit submission endpoint.
 * Limits users to 5 requests per minute to prevent abuse and manage API costs.
 */
export const auditRateLimit = createRateLimiter(5, '1 m', 'audit-submit');

/**
 * Helper function for the audit engine to check rate limits.
 * Expected by the implementation guidelines: `const { success } = await checkRateLimit(ip);`
 * 
 * @param identifier - A unique identifier for the client (usually IP address)
 */
export async function checkRateLimit(identifier: string) {
  return await auditRateLimit.limit(identifier);
}

/**
 * Rate limiter specifically configured for the lead capture endpoint.
 * Stricter limit (3 requests per minute) to prevent abuse and spam.
 */
export const leadCaptureRateLimit = createRateLimiter(3, '1 m', 'lead-capture');

export async function checkLeadCaptureRateLimit(identifier: string) {
  return await leadCaptureRateLimit.limit(identifier);
}
