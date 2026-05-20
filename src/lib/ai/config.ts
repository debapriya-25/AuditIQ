export const AI_CONFIG = {
  model: 'gemini-1.5-flash',
  timeoutMs: 10000,
  maxRetries: 2,
  temperature: 0.2,
  // Keep output bounded since we only want a short paragraph summary
  maxOutputTokens: 256,
};
