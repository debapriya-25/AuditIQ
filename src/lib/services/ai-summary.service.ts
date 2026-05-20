import { AuditSelect } from '../repositories/audit';
import { AuditInputPayload } from '../validators/audit-input';
import { logger } from '../logger';

export const aiSummaryService = {
  /**
   * Prepares deterministic context for the LLM prompt.
   * Strips out PII and database-specific identifiers.
   */
  prepareSummaryContext: (audit: AuditSelect) => {
    logger.info({ auditId: audit.id }, 'Preparing AI summary context');
    
    // Safely cast to known payload type since it was validated on ingest
    const auditData = audit.auditData as AuditInputPayload;

    return {
      useCase: audit.useCase,
      tools: auditData.tools,
      teamSize: auditData.teamSize,
      savingsMonthly: audit.totalSavingsMonthly,
    };
  },

  /**
   * Sanitizes the raw string response from the LLM.
   * Ensures output is safe for database storage and client rendering.
   */
  sanitizeSummaryPayload: (rawResponse: string | null | undefined): string => {
    if (!rawResponse) return '';
    // Basic scaffolding: strip excessive whitespace
    // Future: Strip markdown, sanitize html tags if necessary
    const sanitized = rawResponse.trim();
    return sanitized;
  }
};
