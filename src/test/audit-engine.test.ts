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

});
