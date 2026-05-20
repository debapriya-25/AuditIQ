export const dynamic = 'force-dynamic';

import { withRouteHandler } from '../../../../lib/api/handler';
import { apiResponse } from '../../../../lib/api/response';
import { auditService } from '../../../../lib/services/audit.service';
import { ValidationError } from '../../../../lib/errors';

export const GET = withRouteHandler(async (ctx) => {
  // 1. Parse URL params (slug)
  const url = new URL(ctx.req.url);
  const slug = url.searchParams.get('slug');

  if (!slug || slug.length !== 10) {
    throw new ValidationError('Invalid or missing audit slug parameter');
  }

  // 2. Fetch Audit by Public Slug
  const audit = await auditService.getAuditBySlug(slug);

  // 3. Retrieve persisted AI summary (stored in auditData during generation)
  const auditData = audit.auditData as any;
  const aiSummary = auditData.aiSummary || 'Summary not available for this audit.';

  // 4. Serialize public-safe DTO
  // Never expose internal ID, email addresses, or un-sanitized metrics.
  return apiResponse.success({
    useCase: audit.useCase,
    totalSavingsMonthly: audit.totalSavingsMonthly,
    aiSummary,
  });
});
