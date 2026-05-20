import { leadRepository, LeadSelect } from '../repositories/lead';
import { auditRepository } from '../repositories/audit';
import { LeadInputPayload } from '../validators/lead-input';
import { Decimal } from 'decimal.js';
import { NotFoundError, InternalServerError } from '../errors';
import { logger } from '../logger';

export const leadService = {
  /**
   * Orchestrates capturing a lead for a specific audit.
   * Handles idempotency and deterministic business logic (e.g., high value tiering).
   */
  captureLeadWorkflow: async (payload: LeadInputPayload): Promise<LeadSelect> => {
    logger.info({ auditId: payload.auditId }, 'Starting captureLeadWorkflow');

    try {
      // 1. Validate audit exists via repository
      const audit = await auditRepository.getAuditById(payload.auditId);
      if (!audit) {
        logger.warn({ auditId: payload.auditId }, 'Associated audit not found for lead capture');
        throw new NotFoundError('Associated audit not found');
      }

      // 2. Idempotency Check
      // If user already submitted their email for this specific audit, return existing record
      // to prevent spam and duplicate processing.
      const existingLead = await leadRepository.getLeadByEmail(payload.email);
      if (existingLead && existingLead.auditId === payload.auditId) {
         logger.info({ auditId: payload.auditId }, 'Idempotency hit: Lead already exists for this audit');
         return existingLead;
      }

      // 3. Deterministic Business Logic
      // E.g., Flag leads as 'high value' if their projected savings > $500/mo
      const savings = new Decimal(audit.totalSavingsMonthly);
      const threshold = new Decimal('500.00');
      const highValue = savings.greaterThanOrEqualTo(threshold);

      // 4. Persist to repository boundary
      const lead = await leadRepository.createLead({
        email: payload.email,
        auditId: payload.auditId,
        companyName: payload.companyName ?? null,
        role: payload.role ?? null,
        teamSize: payload.teamSize ?? null,
        notifyOnly: payload.notifyOnly ?? false,
        savingsPerMonth: savings.toFixed(2),
        highValue,
      });

      // 5. Future: Trigger async background queues for notifications/welcome emails here.
      // E.g., await queueService.enqueue('send_welcome_email', { email: lead.email });

      logger.info({ leadId: lead.id, auditId: payload.auditId, highValue }, 'Lead captured successfully');
      return lead;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      logger.error({ err: error, auditId: payload.auditId }, 'Failed to capture lead');
      throw new InternalServerError('Failed to capture lead details');
    }
  },

  /**
   * Retrieves non-sensitive insights for a lead.
   * Useful for personalization logic in subsequent visits.
   */
  getLeadInsights: async (email: string): Promise<LeadSelect | undefined> => {
    logger.info('Fetching lead insights');
    return await leadRepository.getLeadByEmail(email);
  }
};
