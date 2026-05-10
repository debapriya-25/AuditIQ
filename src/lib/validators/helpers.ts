import { z } from 'zod';
import { ValidationError } from '../errors/AppError';

/**
 * Parses and validates the JSON body of a Request.
 * Rejects malformed JSON and enforces the strict Zod schema.
 */
export async function parseRequestBody<T>(req: Request, schema: z.ZodSchema<T>): Promise<T> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError('Invalid JSON body');
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError('Validation failed', parsed.error.issues);
  }

  return parsed.data;
}

/**
 * Parses and validates search parameters from a Request URL.
 */
export function parseSearchParams<T>(req: Request, schema: z.ZodSchema<T>): T {
  let url: URL;
  try {
    url = new URL(req.url);
  } catch {
    throw new ValidationError('Invalid URL');
  }
  
  const params = Object.fromEntries(url.searchParams.entries());
  const parsed = schema.safeParse(params);
  if (!parsed.success) {
    throw new ValidationError('Invalid query parameters', parsed.error.issues);
  }

  return parsed.data;
}

/**
 * Parses and validates dynamic route parameters (e.g., from Next.js params).
 */
export function parseRouteParams<T>(params: unknown, schema: z.ZodSchema<T>): T {
  const parsed = schema.safeParse(params);
  if (!parsed.success) {
    throw new ValidationError('Invalid route parameters', parsed.error.issues);
  }

  return parsed.data;
}
