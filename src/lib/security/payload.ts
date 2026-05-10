import { ValidationError } from '../errors/AppError';

// 64KB max payload size to prevent DoS/memory exhaustion (matching next.config defaults)
const MAX_PAYLOAD_SIZE = 64 * 1024; 

/**
 * Validates the Content-Length header to reject oversized payloads early,
 * before buffering the entire request body into memory.
 */
export function enforcePayloadSizeLimit(req: Request, maxSize: number = MAX_PAYLOAD_SIZE): void {
  const contentLength = req.headers.get('content-length');
  if (!contentLength) return; // If chunked or missing, we can't reliably check here

  const size = parseInt(contentLength, 10);
  if (isNaN(size)) {
    throw new ValidationError('Invalid Content-Length header');
  }

  if (size > maxSize) {
    throw new ValidationError('Payload too large', { 
      provided: size, 
      maximum: maxSize 
    });
  }
}
