export const dynamic = 'force-dynamic';

import { withRouteHandler } from '../../../../lib/api/handler';
import { apiResponse } from '../../../../lib/api/response';
import { leadInputSchema } from '../../../../lib/validators/lead-input';
import { leadService } from '../../../../lib/services/lead.service';
import { checkLeadCaptureRateLimit } from '../../../../lib/rate-limit';
import { RateLimitError, ValidationError } from '../../../../lib/errors';

export const POST = withRouteHandler(async (ctx) => {
  // 1. Stricter Rate Limiting for Lead Capture
  const rateLimitResult = await checkLeadCaptureRateLimit(ctx.fingerprint);
  if (!rateLimitResult.success) {
    throw new RateLimitError('Too many capture requests. Please try again later.');
  }

  // 2. Parse and Validate Request Payload
  const rawBody = await ctx.req.json();
  const parsed = leadInputSchema.safeParse(rawBody);

  if (!parsed.success) {
    throw new ValidationError('Invalid lead capture payload', parsed.error.format());
  }

  // 3. Orchestrate Lead Workflow
  // Service handles idempotency, DB validation, logic tiering.
  await leadService.captureLeadWorkflow(parsed.data);

  // 4. Return standard 202 Accepted
  return apiResponse.accepted('Lead captured successfully');
});
