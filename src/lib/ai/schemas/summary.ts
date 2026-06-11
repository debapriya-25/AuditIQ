import { z } from 'zod';

export const aiSummaryResponseSchema = z.object({
  // Enforce a meaningful length so a trivially short / empty model response
  // (e.g. a one-liner "Everything looks optimized.") is rejected and the
  // data-rich deterministic fallback is used instead.
  summary: z
    .string()
    .trim()
    .min(60, 'Summary too short')
    .max(800)
    .describe('A specific 3-5 sentence summary of the audit findings, written in a professional tone without markdown.'),
});

export type AISummaryResponse = z.infer<typeof aiSummaryResponseSchema>;
