/**
 * Safely extracts the true client IP in a Vercel serverless environment.
 * Handles the x-forwarded-for chain safely by taking the leftmost IP (the original client).
 * Prevents IP spoofing via proxy chaining.
 */
export function extractClientIp(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take the leftmost IP
    const ip = forwardedFor.split(',')[0]?.trim();
    if (ip) return ip;
  }
  
  // Fallback for local development or direct access without a proxy
  return '127.0.0.1';
}
