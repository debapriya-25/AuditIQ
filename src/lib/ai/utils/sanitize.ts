/**
 * Safely sanitizes raw LLM output, stripping out potential markdown code fences
 * so that it can be cleanly parsed as JSON.
 */
export function sanitizeOutput(rawResponse: string): string {
  if (!rawResponse) return '';

  let sanitized = rawResponse.trim();

  // Strip markdown code fences if the model aggressively wraps JSON
  if (sanitized.startsWith('```json')) {
    sanitized = sanitized.substring(7);
  } else if (sanitized.startsWith('```')) {
    sanitized = sanitized.substring(3);
  }

  if (sanitized.endsWith('```')) {
    sanitized = sanitized.substring(0, sanitized.length - 3);
  }

  return sanitized.trim();
}
