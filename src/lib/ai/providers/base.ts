export interface AIProviderConfig {
  model: string;
  timeoutMs: number;
  maxRetries: number;
  temperature: number;
  maxOutputTokens: number;
}

export interface AIProvider {
  /**
   * Generates a structured summary based on the provided prompt and system prompt.
   * Returns a raw string (which should be JSON formatted).
   */
  generateSummary(prompt: string, systemPrompt: string): Promise<string>;
}
