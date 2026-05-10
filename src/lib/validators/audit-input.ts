import { z } from 'zod';

const toolIdSchema = z.enum([
  'cursor', 'github_copilot', 'claude', 'chatgpt',
  'anthropic_api', 'openai_api', 'gemini', 'windsurf',
]);

const toolInputSchema = z.object({
  toolId: toolIdSchema,
  // Sanitize and constrain strings
  plan: z.string().trim().min(1).max(50),
  // Strict numeric limits to prevent oversized/invalid mathematical operations
  seats: z.number().int().min(1).max(10_000),
  monthlySpend: z.number().min(0).max(1_000_000),
});

export const auditInputSchema = z.object({
  tools: z
    .array(toolInputSchema)
    .min(1, 'At least one tool is required')
    .max(20, 'Maximum 20 tools supported to prevent abuse')
    .refine(
      (tools) => new Set(tools.map(t => t.toolId)).size === tools.length,
      { message: 'Duplicate tools are not allowed' }
    ),
  teamSize: z.number().int().min(1).max(10_000),
  useCase: z.enum(['coding', 'writing', 'data_analysis', 'research', 'mixed']),
  website: z.string().optional(), // Honeypot field — expected to be empty, string injection is safe because it's ignored
});

export type AuditInputPayload = z.infer<typeof auditInputSchema>;
