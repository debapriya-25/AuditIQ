import { getDb } from '../db/client';
import { leads } from '../db/schema';
import { eq } from 'drizzle-orm';
import { withDbCatch } from './base';

export type LeadInsert = typeof leads.$inferInsert;
export type LeadSelect = typeof leads.$inferSelect;

export const leadRepository = {
  createLead: (data: LeadInsert): Promise<LeadSelect> => {
    return withDbCatch('createLead', async () => {
      const db = getDb();
      const [result] = await db.insert(leads).values(data).returning();
      if (!result) throw new Error('Failed to create lead');
      return result;
    });
  },

  getLeadByEmail: (email: string): Promise<LeadSelect | undefined> => {
    return withDbCatch('getLeadByEmail', async () => {
      const db = getDb();
      return await db.query.leads.findFirst({
        where: eq(leads.email, email),
      });
    });
  },

  getLeadsForAudit: (auditId: string): Promise<LeadSelect[]> => {
    return withDbCatch('getLeadsForAudit', async () => {
      const db = getDb();
      return await db.query.leads.findMany({
        where: eq(leads.auditId, auditId),
      });
    });
  }
};
