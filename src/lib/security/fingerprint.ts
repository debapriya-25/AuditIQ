import { createHash } from 'crypto';
import { extractClientIp } from './ip';

/**
 * Generates a stable, privacy-safe fingerprint for a request.
 * Useful for rate limiting and abuse detection where an IP alone might be too broad (e.g. NAT).
 * Hashing ensures no raw PII (like plain IP addresses) is stored longer than necessary in rate limit buckets.
 */
export function generateRequestFingerprint(req: Request): string {
  const ip = extractClientIp(req);
  const userAgent = req.headers.get('user-agent') || 'unknown-ua';
  
  const hash = createHash('sha256');
  hash.update(`${ip}|${userAgent}`);
  return hash.digest('hex');
}
