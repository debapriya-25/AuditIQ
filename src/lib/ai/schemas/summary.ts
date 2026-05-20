import { z } from 'zod';

export const aiSummaryResponseSchema = z.object({
  summary: z.string().describe('A concise 2-4 sentence summary of the audit findings, written in a professional tone without markdown.'),
});

export type AISummaryResponse = z.infer<typeof aiSummaryResponseSchema>;
