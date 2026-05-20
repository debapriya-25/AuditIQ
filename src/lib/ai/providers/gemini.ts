import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { AIProvider, AIProviderConfig } from './base';
import { InternalServerError } from '../../errors/AppError';

export class GeminiProvider implements AIProvider {
  private genAI: GoogleGenerativeAI | null = null;
  private model: GenerativeModel | null = null;
  private config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  private init() {
    if (!this.genAI || !this.model) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new InternalServerError('GEMINI_API_KEY is missing from environment');
      }

      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({
        model: this.config.model,
        generationConfig: {
          temperature: this.config.temperature,
          maxOutputTokens: this.config.maxOutputTokens,
          responseMimeType: 'application/json',
        },
      });
    }
    return this.model;
  }

  async generateSummary(prompt: string, systemPrompt: string): Promise<string> {
    const model = this.init();
    
    // For Gemini, system instructions are passed as a specialized part of the config or prompt.
    // However, @google/generative-ai 0.24+ supports systemInstruction in getGenerativeModel,
    // but to remain flexible and since we init lazy, we can prepend the system prompt or use the systemInstruction field.
    // We will prepend it to the user prompt if systemInstruction is not dynamically overridable per-call,
    // or recreate the model instance if system instructions change (in this app they are static).
    
    // To be completely safe and avoid re-initializing, we can just inject the system prompt into the content.
    const fullPrompt = `${systemPrompt}\n\nUSER DATA:\n${prompt}`;

    try {
      const result = await model.generateContent(fullPrompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      // Re-throw to be caught by the retry wrapper
      throw new Error(`Gemini Provider Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
