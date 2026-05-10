import { getDb } from '../db/client';
import { promptLogs } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { withDbCatch } from './base';

export type PromptLogInsert = typeof promptLogs.$inferInsert;
export type PromptLogSelect = typeof promptLogs.$inferSelect;

export const promptLogRepository = {
  createPromptLog: (data: PromptLogInsert): Promise<PromptLogSelect> => {
    return withDbCatch('createPromptLog', async () => {
      const db = getDb();
      const [result] = await db.insert(promptLogs).values(data).returning();
      if (!result) throw new Error('Failed to create prompt log');
      return result;
    });
  },

  getPromptLogsForAudit: (auditId: string): Promise<PromptLogSelect[]> => {
    return withDbCatch('getPromptLogsForAudit', async () => {
      const db = getDb();
      return await db.query.promptLogs.findMany({
        where: eq(promptLogs.auditId, auditId),
        orderBy: [desc(promptLogs.createdAt)],
      });
    });
  }
};
