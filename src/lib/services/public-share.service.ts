import { auditRepository, AuditSelect } from '../repositories/audit';
import { AuditInputPayload } from '../validators/audit-input';
import { NotFoundError, InternalServerError } from '../errors';
import { logger } from '../logger';

export type PublicAuditView = Pick<AuditSelect, 'useCase' | 'totalSavingsMonthly' | 'createdAt'> & {
  toolCount: number;
};

export const publicShareService = {
  /**
   * Orchestrates the retrieval of a safe, public view of an audit.
   * Prevents Internal Direct Object Reference (IDOR) by relying on a non-sequential,
   * unguessable public slug, and strictly strips out sensitive details like user inputs.
   */
  getPublicAuditView: async (slug: string): Promise<PublicAuditView> => {
    logger.info({ slug }, 'Fetching public audit view');
    
    try {
      const audit = await auditRepository.getAuditBySlug(slug);
      
      if (!audit) {
        logger.warn({ slug }, 'Public audit not found');
        throw new NotFoundError('Public audit not found');
      }

      const auditData = audit.auditData as AuditInputPayload;
      const tools = auditData?.tools || [];
      
      // Return only safe aggregates. Never return the raw `auditData` or internal IDs
      return {
        useCase: audit.useCase,
        totalSavingsMonthly: audit.totalSavingsMonthly,
        createdAt: audit.createdAt,
        toolCount: tools.length,
      };
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      logger.error({ err: error, slug }, 'Failed to get public audit view');
      throw new InternalServerError('An error occurred retrieving public audit');
    }
  }
};
