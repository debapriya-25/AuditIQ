export const dynamic = 'force-dynamic';

import { withRouteHandler } from '../../../../lib/api/handler';
import { apiResponse } from '../../../../lib/api/response';
import { auditInputSchema } from '../../../../lib/validators/audit-input';
import { auditService } from '../../../../lib/services/audit.service';
import { checkRateLimit } from '../../../../lib/rate-limit';
import { RateLimitError, ValidationError } from '../../../../lib/errors';

export const POST = withRouteHandler(async (ctx) => {
  // 1. Rate Limiting via context fingerprint
  const rateLimitResult = await checkRateLimit(ctx.fingerprint);
  if (!rateLimitResult.success) {
    throw new RateLimitError('Too many audit requests from this IP. Please try again later.');
  }

  // 2. Parse and Validate Request Payload
  const rawBody = await ctx.req.json();
  const parsed = auditInputSchema.safeParse(rawBody);

  if (!parsed.success) {
    throw new ValidationError('Invalid request payload', parsed.error.format());
  }

  const payload = parsed.data;

  // 3. Honeypot check for bots
  if (payload.website && payload.website.length > 0) {
    ctx.logger.warn({ fingerprint: ctx.fingerprint }, 'Honeypot triggered, faking success');
    // Return fake success for bots
    return apiResponse.success({ publicSlug: 'fake-slug', engineResult: {}, aiSummary: '' });
  }

  // 4. Orchestrate Audit Workflow
  // This service internally handles the deterministic engine, DB persistence, AI summary, and fallback.
  const { audit, engineResult, aiSummary } = await auditService.createAuditWorkflow(payload);

  // 5. Serialize Response (DTO)
  // Ensure we do NOT leak internal UUIDs or raw DB payloads.
  return apiResponse.success({
    publicSlug: audit.publicSlug,
    engineResult,
    aiSummary,
  });
});
