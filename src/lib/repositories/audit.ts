import { getDb } from '../db/client';
import { audits } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { withDbCatch } from './base';

export type AuditInsert = typeof audits.$inferInsert;
export type AuditSelect = typeof audits.$inferSelect;

export const auditRepository = {
  createAudit: (data: AuditInsert): Promise<AuditSelect> => {
    return withDbCatch('createAudit', async () => {
      const db = getDb();
      const [result] = await db.insert(audits).values(data).returning();
      if (!result) throw new Error('Failed to create audit');
      return result;
    });
  },

  getAuditById: (id: string): Promise<AuditSelect | undefined> => {
    return withDbCatch('getAuditById', async () => {
      const db = getDb();
      return await db.query.audits.findFirst({
        where: eq(audits.id, id),
      });
    });
  },

  getAuditBySlug: (slug: string): Promise<AuditSelect | undefined> => {
    return withDbCatch('getAuditBySlug', async () => {
      const db = getDb();
      return await db.query.audits.findFirst({
        where: eq(audits.publicSlug, slug),
      });
    });
  },

  updateAuditSummary: (id: string, newAuditData: unknown): Promise<AuditSelect | undefined> => {
    return withDbCatch('updateAuditSummary', async () => {
      const db = getDb();
      const [result] = await db.update(audits)
        .set({ auditData: newAuditData })
        .where(eq(audits.id, id))
        .returning();
      return result;
    });
  },

  listRecentAudits: (limit: number = 50): Promise<AuditSelect[]> => {
    return withDbCatch('listRecentAudits', async () => {
      const db = getDb();
      return await db.query.audits.findMany({
        orderBy: [desc(audits.createdAt)],
        limit,
      });
    });
  }
};
