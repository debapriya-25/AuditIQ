import { z } from 'zod';

export const toolIdSchema = z.enum([
  'cursor',
  'github_copilot',
  'claude',
  'chatgpt',
  'anthropic_api',
  'openai_api',
  'gemini',
  'windsurf',
  'v0',
]);

export const useCaseSchema = z.enum(['coding', 'writing', 'data analysis', 'research', 'mixed']);

export const userToolInputSchema = z.object({
  toolId: toolIdSchema,
  plan: z.string().min(1, 'Plan name is required'),
  seats: z.number().int().min(1, 'Seats must be at least 1').or(z.literal(0)),
  monthlySpend: z.number().min(0, 'Monthly spend cannot be negative'),
});

export const globalInputsSchema = z.object({
  teamSize: z.number().int().min(1, 'Team size must be at least 1'),
  useCase: useCaseSchema,
});

export const auditInputSchema = z.object({
  tools: z.array(userToolInputSchema).min(1, 'At least one tool must be evaluated'),
  global: globalInputsSchema,
});
