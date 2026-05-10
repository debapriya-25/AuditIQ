import { z } from 'zod';

export const summaryParamsSchema = z.object({
  auditId: z.string().uuid('Invalid audit ID format'),
});

export type SummaryParams = z.infer<typeof summaryParamsSchema>;
