import { describe, it, expect } from 'vitest';
import { runAuditEngine } from '../lib/audit/engine';
import { AuditInput, FinalAuditResult } from '../lib/audit/types';
import { AuditSelect } from '../lib/repositories/audit';
import { aiSummaryService } from '../lib/services/ai-summary.service';
import { generateFallbackSummary } from '../lib/ai/serializers';

/** The previous fallback — only ever saw the total savings number. */
function legacyFallback(totalSavings: number): string {
  if (totalSavings > 0) {
    return `Your audit is complete. We identified $${totalSavings} in potential monthly savings by optimizing your tool allocations and switching to more cost-effective plans. Review the itemized breakdown below for specific recommendations.`;
  }
  return 'Your audit is complete. Your current AI tool stack is fully optimized for your team size and use case. No immediate changes are recommended.';
}

function mockAudit(input: AuditInput, engine: FinalAuditResult): AuditSelect {
  return {
    id: '00000000-0000-0000-0000-000000000000',
    auditData: {
      tools: input.tools,
      teamSize: input.global.teamSize,
      useCase: input.global.useCase,
      website: '',
    },
    useCase: input.global.useCase,
    totalSavingsMonthly: engine.totalSavingsMonthly,
    createdAt: new Date(),
    publicSlug: 'demoSlug12',
  } as AuditSelect;
}

function summarize(label: string, input: AuditInput) {
  const engine = runAuditEngine(input);
  const audit = mockAudit(input, engine);
  const context = aiSummaryService.prepareSummaryContext(audit, engine.toolResults);
  const before = legacyFallback(Number(engine.totalSavingsMonthly));
  const after = generateFallbackSummary(context);
  // eslint-disable-next-line no-console
  console.log(
    `\n=== ${label} ===\nBEFORE: ${before}\nAFTER:  ${after}\n`
  );
  return { engine, context, before, after };
}

describe('AI summary quality', () => {
  it('Scenario A — over-provisioned (3 engineers, 20 Claude Team seats)', () => {
    const { after } = summarize('Scenario A', {
      tools: [{ toolId: 'claude', plan: 'Team', seats: 20, monthlySpend: 600 }],
      global: { teamSize: 3, useCase: 'mixed' },
    });

    expect(after).toContain('team of 3');
    expect(after).toContain('Claude');
    expect(after).toContain('$510'); // monthly savings
    expect(after).toContain('$6,120'); // annual savings
    expect(after.toLowerCase()).not.toContain('fully optimized');
  });

  it('Scenario B — correctly sized (5 engineers, Claude Pro, 5 seats) is the only "optimized" case', () => {
    const { context, after } = summarize('Scenario B', {
      tools: [{ toolId: 'claude', plan: 'Pro', seats: 5, monthlySpend: 100 }],
      global: { teamSize: 5, useCase: 'mixed' },
    });

    expect(context.hasOpportunities).toBe(false);
    expect(after).toContain('team of 5');
    expect(after).toContain('$100/month');
    expect(after).toContain('correctly sized');
  });

  it('Scenario C — context-aware (10 engineers, ChatGPT Team, 10 seats)', () => {
    const { after } = summarize('Scenario C', {
      tools: [{ toolId: 'chatgpt', plan: 'Team', seats: 10, monthlySpend: 300 }],
      global: { teamSize: 10, useCase: 'mixed' },
    });

    expect(after).toContain('team of 10');
    expect(after).toContain('ChatGPT');
    expect(after).toContain('annual billing');
    expect(after).toContain('$50');
    expect(after.toLowerCase()).not.toContain('fully optimized');
  });

  it('Multi-tool — names most expensive tool and biggest opportunity', () => {
    const { context, after } = summarize('Multi-tool (team of 8)', {
      tools: [
        { toolId: 'github_copilot', plan: 'Business', seats: 8, monthlySpend: 152 },
        { toolId: 'chatgpt', plan: 'Team', seats: 8, monthlySpend: 240 },
        { toolId: 'claude', plan: 'Pro', seats: 8, monthlySpend: 160 },
      ],
      global: { teamSize: 8, useCase: 'coding' },
    });

    expect(context.mostExpensiveTool?.name).toBe('ChatGPT');
    expect(context.biggestSavingsOpportunity).not.toBeNull();
    expect(after).toContain('team of 8');
    expect(after).toContain('most expensive tool');
    expect(after.toLowerCase()).not.toContain('fully optimized');
  });
});
