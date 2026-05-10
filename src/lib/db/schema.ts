import { pgTable, uuid, text, numeric, integer, boolean, timestamp, jsonb, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const audits = pgTable('audits', {
  id: uuid('id').primaryKey().defaultRandom(),
  auditData: jsonb('audit_data').notNull(),       // Stores the full AuditInput and Tool outputs
  useCase: text('use_case').notNull(),
  totalSavingsMonthly: numeric('total_savings_monthly').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  publicSlug: text('public_slug').unique().notNull(), // 10-char alphanumeric for public shares
}, (table) => {
  return {
    publicSlugIdx: uniqueIndex('public_slug_idx').on(table.publicSlug),
    createdAtIndex: index('audits_created_at_idx').on(table.createdAt),
  };
});

export const auditsRelations = relations(audits, ({ many }) => ({
  leads: many(leads),
  promptLogs: many(promptLogs),
}));

export const leads = pgTable('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull(),
  companyName: text('company_name'),
  role: text('role'),
  teamSize: integer('team_size'),
  auditId: uuid('audit_id').references(() => audits.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  savingsPerMonth: numeric('savings_per_month').notNull(),
  highValue: boolean('high_value').notNull().default(false), // true if savings > $500/mo
  notifyOnly: boolean('notify_only').notNull().default(false),
}, (table) => {
  return {
    auditIdIdx: index('leads_audit_id_idx').on(table.auditId),
    emailIdx: index('leads_email_idx').on(table.email),
    // Ensures idempotency so we don't spam users if they hit submit twice
    auditEmailUnique: uniqueIndex('audit_email_unique_idx').on(table.auditId, table.email),
  };
});

export const leadsRelations = relations(leads, ({ one }) => ({
  audit: one(audits, {
    fields: [leads.auditId],
    references: [audits.id],
  }),
}));

export const promptLogs = pgTable('prompt_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  auditId: uuid('audit_id').references(() => audits.id, { onDelete: 'cascade' }).notNull(),
  prompt: text('prompt').notNull(),               // Verbatim prompt sent to Anthropic
  response: text('response'),                     // Sanitized/fallback response
  modelUsed: text('model_used').notNull(),
  durationMs: integer('duration_ms'),
  wasError: boolean('was_error').notNull().default(false),
  errorReason: text('error_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    auditIdIdx: index('prompt_logs_audit_id_idx').on(table.auditId),
  };
});

export const promptLogsRelations = relations(promptLogs, ({ one }) => ({
  audit: one(audits, {
    fields: [promptLogs.auditId],
    references: [audits.id],
  }),
}));
