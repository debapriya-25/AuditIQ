import { SummaryContext } from '../../services/ai-summary.service';

/**
 * Serializes the deterministic summary context into the user-prompt payload.
 *
 * All figures are pre-computed in `prepareSummaryContext` — the model receives
 * exact numbers (spend, savings, most-expensive tool, largest spend category,
 * biggest opportunity) and only has to narrate them. It must never recompute or
 * invent values.
 */
export function buildAuditSummaryPrompt(context: SummaryContext): string {
  return JSON.stringify(context, null, 2);
}
