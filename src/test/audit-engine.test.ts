import { describe, it, expect } from 'vitest';
import { runAuditEngine } from '../lib/audit/engine';
import { AuditInput, ToolAuditFindings } from '../lib/audit/types';

describe('Audit Engine', () => {

  it('1. Correct savings calculation for a user on GitHub Copilot Business with 2 seats', () => {
    const input: AuditInput = {
      tools: [
        { toolId: 'github_copilot', plan: 'Business', seats: 2, monthlySpend: 38 }
      ],
      global: { teamSize: 2, useCase: 'coding' }
    };

    const result = runAuditEngine(input);
    expect(result.toolResults.length).toBe(1);
    
    const copilotResult = result.toolResults[0];
    if (!copilotResult) throw new Error('Result missing');
    expect(copilotResult.status).toBe('overspending');
    
    // 2 seats * 19 (business) = 38. 2 seats * 10 (individual) = 20. Savings = 18.
    expect(copilotResult.savings.savingsPerMonth).toBe('18.00');
    expect(copilotResult.recommendation.recommendedAction).toContain('Downgrade to Individual');
  });

  it('2. No false savings generated for a user already on optimal plan', () => {
    const input: AuditInput = {
      tools: [
        { toolId: 'cursor', plan: 'Pro', seats: 3, monthlySpend: 60 }
      ],
      global: { teamSize: 3, useCase: 'coding' }
    };

    const result = runAuditEngine(input);
    const cursorResult = result.toolResults[0];
    if (!cursorResult) throw new Error('Result missing');
    expect(cursorResult.status).toBe('optimal');
    expect(cursorResult.savings.savingsPerMonth).toBe('0.00');
  });

  it('3. Use-case-specific alternative surfacing (coding use case + Claude Team)', () => {
    const input: AuditInput = {
      tools: [
        { toolId: 'claude', plan: 'Team', seats: 5, monthlySpend: 150 }
      ],
      global: { teamSize: 5, useCase: 'coding' }
    };

    const result = runAuditEngine(input);
    const claudeResult = result.toolResults[0];
    if (!claudeResult) throw new Error('Result missing');
    expect(claudeResult.status).toBe('switch_recommended');
    expect(claudeResult.recommendation.recommendedAction).toContain('Switch to Cursor Pro or Windsurf');
  });

  it('4. API monthly spend above a threshold flags as "review usage" rather than specific plan switch', () => {
    const input: AuditInput = {
      tools: [
        { toolId: 'anthropic_api', plan: 'usage-based', seats: 0, monthlySpend: 250 }
      ],
      global: { teamSize: 10, useCase: 'mixed' }
    };

    const result = runAuditEngine(input);
    const anthropicResult = result.toolResults[0];
    if (!anthropicResult) throw new Error('Result missing');
    expect(anthropicResult.status).toBe('overspending');
    expect(anthropicResult.recommendation.recommendedAction).toContain('Review API usage');
  });

  it('5. Audit result total equals sum of per-tool savings', () => {
    const input: AuditInput = {
      tools: [
        { toolId: 'github_copilot', plan: 'Business', seats: 2, monthlySpend: 38 }, // saves 18
        { toolId: 'chatgpt', plan: 'Team', seats: 1, monthlySpend: 60 }, // saves 40 (team min 2 seats $60 vs plus $20)
        { toolId: 'cursor', plan: 'Pro', seats: 2, monthlySpend: 40 } // saves 0
      ],
      global: { teamSize: 2, useCase: 'coding' }
    };

    const result = runAuditEngine(input);
    expect(result.totalSavingsMonthly).toBe('58.00'); // 18 + 40 + 0
    expect(result.totalSavingsAnnually).toBe((58 * 12).toFixed(2));
  });

  it('6. Edge case: 0 seats entered doesn\'t crash; 1 seat on a "per-seat" plan handled correctly', () => {
    const input: AuditInput = {
      tools: [
        { toolId: 'cursor', plan: 'Pro', seats: 0, monthlySpend: 0 },
        { toolId: 'github_copilot', plan: 'Business', seats: 1, monthlySpend: 19 }
      ],
      global: { teamSize: 1, useCase: 'coding' }
    };

    const result = runAuditEngine(input);
    expect(result.toolResults.length).toBe(2);
    
    const cursorResult = result.toolResults.find((t: ToolAuditFindings) => t.toolId === 'cursor');
    expect(cursorResult?.status).toBe('optimal'); // Math.max(1, 0) logic in calculateSpend handles 0
    
    const copilotResult = result.toolResults.find((t: ToolAuditFindings) => t.toolId === 'github_copilot');
    expect(copilotResult?.status).toBe('overspending');
    expect(copilotResult?.savings.savingsPerMonth).toBe('9.00'); // 19 - 10
  });

  it('7. Scenario A — over-provisioned seats (3 engineers, 20 Claude Team seats)', () => {
    const input: AuditInput = {
      tools: [
        { toolId: 'claude', plan: 'Team', seats: 20, monthlySpend: 600 }
      ],
      global: { teamSize: 3, useCase: 'mixed' }
    };

    const result = runAuditEngine(input);
    const r = result.toolResults[0];
    if (!r) throw new Error('Result missing');

    // Paying for 20 seats with only 3 engineers must be flagged, not "optimal".
    expect(r.status).toBe('overspending');
    expect(r.recommendation.recommendedAction).toContain('Reduce Claude');
    expect(r.recommendation.recommendedAction).toContain('3 seats');
    // 17 surplus seats @ $30/seat ($600 / 20) = $510/mo.
    expect(r.savings.savingsPerMonth).toBe('510.00');
    expect(result.totalSavingsAnnually).toBe((510 * 12).toFixed(2));
  });

  it('8. Scenario B — correctly sized (5 engineers, Claude Pro, 5 seats) stays optimal', () => {
    const input: AuditInput = {
      tools: [
        { toolId: 'claude', plan: 'Pro', seats: 5, monthlySpend: 100 }
      ],
      global: { teamSize: 5, useCase: 'mixed' }
    };

    const result = runAuditEngine(input);
    const r = result.toolResults[0];
    if (!r) throw new Error('Result missing');

    // Seats match headcount and Pro is the base paid tier — no manufactured savings.
    expect(r.status).toBe('optimal');
    expect(r.savings.savingsPerMonth).toBe('0.00');
  });

  it('9. Scenario C — context-aware recommendation (10 engineers, ChatGPT Team, 10 seats)', () => {
    const input: AuditInput = {
      tools: [
        { toolId: 'chatgpt', plan: 'Team', seats: 10, monthlySpend: 300 }
      ],
      global: { teamSize: 10, useCase: 'mixed' }
    };

    const result = runAuditEngine(input);
    const r = result.toolResults[0];
    if (!r) throw new Error('Result missing');

    // Seats are correctly sized, so the engine must give a context-aware rec
    // (annual billing) rather than a generic "Keep current plan."
    expect(r.status).not.toBe('optimal');
    expect(r.recommendation.recommendedAction).not.toBe('Keep current plan.');
    expect(r.recommendation.recommendedAction).toContain('annual billing');
    // 10 seats × ($30 monthly − $25 annual) = $50/mo.
    expect(r.savings.savingsPerMonth).toBe('50.00');
  });

});
