import { AISummaryResponse } from './schemas/summary';
import { SummaryContext } from '../services/ai-summary.service';

/**
 * Normalizes and formats the validated AI summary for the frontend.
 */
export function serializeAISummary(data: AISummaryResponse): string {
  let text = data.summary.trim();

  // Basic sanity check to prevent gigantic wall-of-text leakage
  if (text.length > 800) {
    text = text.substring(0, 797) + '...';
  }

  return text;
}

function money(n: number): string {
  return `$${Math.round(n).toLocaleString('en-US')}`;
}

/**
 * Deterministic, data-driven fallback used when the LLM is unavailable or
 * returns an invalid response. It reads the SAME context the prompt does, so it
 * references real numbers — team size, monthly/annual spend, the most expensive
 * tool, the biggest savings opportunity, and the total savings.
 *
 * It only describes the stack as "optimized" when the engine genuinely found no
 * opportunities (`hasOpportunities === false`).
 */
export function generateFallbackSummary(ctx: SummaryContext): string {
  const team = `${ctx.teamSize} ${ctx.teamSize === 1 ? 'person' : 'people'}`;
  const tools = `${ctx.toolCount} AI ${ctx.toolCount === 1 ? 'tool' : 'tools'}`;
  const lead = `Your team of ${team} spends ${money(ctx.monthlySpend)}/month (${money(ctx.annualSpend)}/year) across ${tools}.`;

  if (!ctx.hasOpportunities) {
    const expensive = ctx.mostExpensiveTool
      ? ` ${ctx.mostExpensiveTool.name} is your largest line item at ${money(ctx.mostExpensiveTool.monthlySpend)}/month.`
      : '';
    return `${lead}${expensive} The audit found no plan or seat changes that would lower this cost, so your stack is correctly sized for your ${ctx.useCase} use case.`;
  }

  const expensive = ctx.mostExpensiveTool
    ? ` ${ctx.mostExpensiveTool.name} is your most expensive tool at ${money(ctx.mostExpensiveTool.monthlySpend)}/month.`
    : '';

  const opp = ctx.biggestSavingsOpportunity;
  const opportunity = opp
    ? opp.savingsPerMonth > 0
      ? ` Your biggest opportunity: ${opp.recommendedAction} That alone saves about ${money(opp.savingsPerMonth)}/month (${money(opp.savingsPerYear)}/year).`
      : ` Top recommendation: ${opp.recommendedAction}`
    : '';

  const total =
    ctx.monthlySavings > 0
      ? ` In total, you could cut ${money(ctx.monthlySavings)}/month (${money(ctx.annualSavings)}/year) — roughly ${ctx.savingsPct}% of your current AI spend.`
      : '';

  return `${lead}${expensive}${opportunity}${total}`.replace(/\s+/g, ' ').trim();
}
