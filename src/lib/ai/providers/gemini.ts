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

  private init(systemInstruction: string): GenerativeModel {
    if (!this.genAI || !this.model) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new InternalServerError('GEMINI_API_KEY is missing from environment');
      }

      this.genAI = new GoogleGenerativeAI(apiKey);
      // Pass the system prompt as a first-class `systemInstruction` (supported in
      // @google/generative-ai 0.24+) rather than concatenating it into the user
      // content — the model adheres to it far more reliably. The system prompt is
      // static, so caching the model instance is safe.
      this.model = this.genAI.getGenerativeModel({
        model: this.config.model,
        systemInstruction,
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
    const model = this.init(systemPrompt);

    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      // Re-throw to be caught by the retry wrapper
      throw new Error(`Gemini Provider Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
