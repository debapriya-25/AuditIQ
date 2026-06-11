import { AuditSelect } from '../repositories/audit';
import { AuditInputPayload } from '../validators/audit-input';
import { AuditStatus, ToolAuditFindings, ToolId } from '../audit/types';
import { TOOL_DISPLAY_NAMES } from '../audit/heuristics';
import { logger } from '../logger';

/** Coarse spend categories so the summary can name the biggest area of spend. */
const TOOL_CATEGORY: Record<ToolId, string> = {
  cursor: 'AI coding assistants',
  github_copilot: 'AI coding assistants',
  windsurf: 'AI coding assistants',
  v0: 'AI coding assistants',
  claude: 'AI chat assistants',
  chatgpt: 'AI chat assistants',
  gemini: 'AI chat assistants',
  anthropic_api: 'API usage',
  openai_api: 'API usage',
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export interface SummaryToolLine {
  name: string;
  plan: string;
  seats: number;
  monthlySpend: number;
  annualSpend: number;
  status: AuditStatus;
  savingsPerMonth: number;
  recommendedAction: string;
  reason: string;
}

export interface SummaryContext {
  teamSize: number;
  useCase: string;
  currency: 'USD';
  toolCount: number;
  monthlySpend: number;
  annualSpend: number;
  monthlySavings: number;
  annualSavings: number;
  savingsPct: number;
  /** True only when the engine produced at least one non-optimal finding. */
  hasOpportunities: boolean;
  mostExpensiveTool: { name: string; monthlySpend: number; annualSpend: number } | null;
  largestSpendCategory: { category: string; monthlySpend: number; sharePct: number } | null;
  biggestSavingsOpportunity:
    | { name: string; savingsPerMonth: number; savingsPerYear: number; recommendedAction: string }
    | null;
  recommendedActions: string[];
  tools: SummaryToolLine[];
}

export const aiSummaryService = {
  /**
   * Builds a fully deterministic, PII-free context object from the audit record
   * and engine findings. Every figure the summary needs (spend, savings, the
   * most expensive tool, the largest spend category, the biggest opportunity)
   * is pre-computed here — the LLM only narrates it, it never does the math.
   */
  prepareSummaryContext: (
    audit: AuditSelect,
    findings: ToolAuditFindings[]
  ): SummaryContext => {
    logger.info({ auditId: audit.id }, 'Preparing AI summary context');

    const auditData = audit.auditData as AuditInputPayload;
    const inputByTool = new Map<string, AuditInputPayload['tools'][number]>(
      auditData.tools.map((t) => [t.toolId, t])
    );

    const tools: SummaryToolLine[] = findings.map((f) => {
      const input = inputByTool.get(f.toolId);
      const monthlySpend = round2(Number(f.savings.currentMonthlySpend));
      return {
        name: TOOL_DISPLAY_NAMES[f.toolId],
        plan: input?.plan ?? 'unknown',
        seats: input?.seats ?? 1,
        monthlySpend,
        annualSpend: round2(monthlySpend * 12),
        status: f.status,
        savingsPerMonth: round2(Number(f.savings.savingsPerMonth)),
        recommendedAction: f.recommendation.recommendedAction,
        reason: f.recommendation.reason,
      };
    });

    const monthlySpend = round2(tools.reduce((acc, t) => acc + t.monthlySpend, 0));
    const monthlySavings = round2(Number(audit.totalSavingsMonthly));
    const savingsPct =
      monthlySpend > 0 ? Math.round((monthlySavings / monthlySpend) * 100) : 0;
    const hasOpportunities = findings.some((f) => f.status !== 'optimal');

    // Most expensive single tool.
    const mostExpensive =
      tools.length > 0
        ? tools.reduce((max, t) => (t.monthlySpend > max.monthlySpend ? t : max))
        : null;

    // Largest spend category (coding assistants vs chat vs API).
    const categoryTotals = new Map<string, number>();
    for (const f of findings) {
      const category = TOOL_CATEGORY[f.toolId];
      const spend = Number(f.savings.currentMonthlySpend);
      categoryTotals.set(category, (categoryTotals.get(category) ?? 0) + spend);
    }
    let largestSpendCategory: SummaryContext['largestSpendCategory'] = null;
    for (const [category, spend] of categoryTotals) {
      if (!largestSpendCategory || spend > largestSpendCategory.monthlySpend) {
        largestSpendCategory = {
          category,
          monthlySpend: round2(spend),
          sharePct: monthlySpend > 0 ? Math.round((spend / monthlySpend) * 100) : 0,
        };
      }
    }

    // Biggest savings opportunity (highest-saving non-optimal tool; falls back
    // to the first non-optimal recommendation when no dollar saving applies).
    const opportunities = tools
      .filter((t) => t.status !== 'optimal')
      .sort((a, b) => b.savingsPerMonth - a.savingsPerMonth);
    const top = opportunities[0];

    return {
      teamSize: auditData.teamSize,
      useCase: audit.useCase,
      currency: 'USD',
      toolCount: tools.length,
      monthlySpend,
      annualSpend: round2(monthlySpend * 12),
      monthlySavings,
      annualSavings: round2(monthlySavings * 12),
      savingsPct,
      hasOpportunities,
      mostExpensiveTool: mostExpensive
        ? {
            name: mostExpensive.name,
            monthlySpend: mostExpensive.monthlySpend,
            annualSpend: mostExpensive.annualSpend,
          }
        : null,
      largestSpendCategory,
      biggestSavingsOpportunity: top
        ? {
            name: top.name,
            savingsPerMonth: top.savingsPerMonth,
            savingsPerYear: round2(top.savingsPerMonth * 12),
            recommendedAction: top.recommendedAction,
          }
        : null,
      recommendedActions: tools
        .filter((t) => t.status !== 'optimal')
        .map((t) => `${t.name}: ${t.recommendedAction}`),
      tools,
    };
  },

  /**
   * Sanitizes the raw string response from the LLM for safe storage/rendering.
   */
  sanitizeSummaryPayload: (rawResponse: string | null | undefined): string => {
    if (!rawResponse) return '';
    return rawResponse.trim();
  },
};
