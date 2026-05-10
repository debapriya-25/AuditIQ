import { z } from 'zod';

export const leadInputSchema = z.object({
  auditId: z.string().uuid('Invalid audit ID format'),
  // Standardize email to lowercase and trim whitespace
  email: z.string().trim().toLowerCase().email('Please enter a valid email address'),
  // Max length protections to prevent DB overflow / abuse
  companyName: z.string().trim().max(200).optional(),
  role: z.string().trim().max(100).optional(),
  teamSize: z.number().int().min(1).max(100_000).optional(),
  notifyOnly: z.boolean().optional().default(false),
});

export type LeadInputPayload = z.infer<typeof leadInputSchema>;
