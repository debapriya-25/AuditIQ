import { auditRepository, AuditSelect } from '../repositories/audit';
import { AuditInputPayload } from '../validators/audit-input';
import { customAlphabet } from 'nanoid';
import { Decimal } from 'decimal.js';
import { NotFoundError, InternalServerError } from '../errors';
import { logger } from '../logger';
import { runAuditEngine, FinalAuditResult } from '../audit';
import { generateAuditSummary } from '../ai';

// Use a safe, readable alphabet for slugs to avoid offensive words and ambiguity
const generateSlug = customAlphabet('23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz', 10);

export const auditService = {
  /**
   * Orchestrates the creation of a new audit.
   * Ensures deterministic business logic and abstracts repository interactions.
   */
  createAuditWorkflow: async (payload: AuditInputPayload): Promise<{ audit: AuditSelect, engineResult: FinalAuditResult, aiSummary: string }> => {
    logger.info({ useCase: payload.useCase, toolsCount: payload.tools.length }, 'Starting createAuditWorkflow');

    try {
      // 1. Generate safe public identifier
      const publicSlug = generateSlug();
      
      // 2. Deterministic calculation scaffolding
      const engineInput = {
        tools: payload.tools,
        global: {
          teamSize: payload.teamSize,
          useCase: payload.useCase,
        }
      };
      
      const engineResult = runAuditEngine(engineInput as any); // using any for enum mismatch bridging
      const totalSavingsMonthly = engineResult.totalSavingsMonthly;

      // 3. Persist to repository boundary
      const audit = await auditRepository.createAudit({
        auditData: payload,
        useCase: payload.useCase,
        totalSavingsMonthly,
        publicSlug,
      });

      // 4. Generate AI Summary (with fallback safety built-in)
      // Pass the generated audit record and the engine tool results
      const aiSummary = await generateAuditSummary(audit, engineResult.toolResults);
      
      // Note: If you want to persist the summary, you can update the record here.
      // We will assume it gets stored inside auditData if needed, or we just return it.
      // Wait, the instructions say "AI summaries should be generated once during audit workflow creation and persisted."
      // So we should persist it. Let's update the auditData to include it.
      const updatedAuditData = { ...payload, aiSummary };
      await auditRepository.updateAuditSummary(audit.id, updatedAuditData);

      // Mutate the local object so we can return it as-is without re-fetching
      audit.auditData = updatedAuditData;

      logger.info({ auditId: audit.id, publicSlug }, 'Audit created and summarized successfully');
      return { audit, engineResult, aiSummary };
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
