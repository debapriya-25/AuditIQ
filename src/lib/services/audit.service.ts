import { auditRepository, AuditSelect } from '../repositories/audit';
import { AuditInputPayload } from '../validators/audit-input';
import { customAlphabet } from 'nanoid';
import { Decimal } from 'decimal.js';
import { NotFoundError, InternalServerError } from '../errors';
import { logger } from '../logger';

// Use a safe, readable alphabet for slugs to avoid offensive words and ambiguity
const generateSlug = customAlphabet('23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz', 10);

export const auditService = {
  /**
   * Orchestrates the creation of a new audit.
   * Ensures deterministic business logic and abstracts repository interactions.
   */
  createAuditWorkflow: async (payload: AuditInputPayload): Promise<AuditSelect> => {
    logger.info({ useCase: payload.useCase, toolsCount: payload.tools.length }, 'Starting createAuditWorkflow');

    try {
      // 1. Generate safe public identifier
      const publicSlug = generateSlug();
      
      // 2. Deterministic calculation scaffolding
      // TODO: Delegate to a dedicated, stateless calculation engine using decimal.js
      // Temporary fallback for foundation phase
      const totalSavingsMonthly = new Decimal('0.00').toFixed(2);

      // 3. Persist to repository boundary
      const audit = await auditRepository.createAudit({
        auditData: payload,
        useCase: payload.useCase,
        totalSavingsMonthly,
        publicSlug,
      });

      logger.info({ auditId: audit.id, publicSlug }, 'Audit created successfully');
      return audit;
    } catch (error) {
      logger.error({ err: error }, 'Failed to create audit workflow');
      throw new InternalServerError('An unexpected error occurred while creating the audit.');
    }
  },

  /**
   * Retrieves an audit by its public slug. Used for shared links.
   */
  getAuditBySlug: async (slug: string): Promise<AuditSelect> => {
    logger.info({ slug }, 'Fetching audit by slug');
    const audit = await auditRepository.getAuditBySlug(slug);
    if (!audit) {
      logger.warn({ slug }, 'Audit not found by slug');
      throw new NotFoundError('Audit not found');
    }
    return audit;
  },

  /**
   * Retrieves an audit summary by internal ID. Used in authenticated/session contexts.
   */
  getAuditSummary: async (id: string): Promise<AuditSelect> => {
    logger.info({ auditId: id }, 'Fetching audit summary by internal ID');
    const audit = await auditRepository.getAuditById(id);
    if (!audit) {
      logger.warn({ auditId: id }, 'Audit not found by ID');
      throw new NotFoundError('Audit not found');
    }
    return audit;
  }
};
