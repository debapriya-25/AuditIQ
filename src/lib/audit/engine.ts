import { AuditInput, AuditResult, ToolAuditResult } from './types';
import { providers } from './providers';

/**
 * The deterministic Audit Engine.
 * Evaluates the user's AI tool subscriptions against deterministic rules
 * to identify overspend and optimal plans.
 */
export function runAudit(input: AuditInput): AuditResult {
  const toolResults: ToolAuditResult[] = [];
  let totalSavingsMonthly = 0;

  for (const toolInput of input.tools) {
    const provider = providers[toolInput.toolId];
    
    // Fallback if an unknown tool is provided
    if (!provider) {
      toolResults.push({
        toolId: toolInput.toolId,
        status: 'optimal',
        currentMonthlySpend: toolInput.monthlySpend,
        savingsPerMonth: 0,
        recommendedAction: 'No recommendations available.',
        reason: 'Tool not currently supported by the audit engine.'
      });
      continue;
    }

    const result = provider.evaluate(toolInput, input.global);
    
    // Ensure savings aren't negative
    if (result.savingsPerMonth < 0) {
      result.savingsPerMonth = 0;
    }
    
    toolResults.push(result);
    totalSavingsMonthly += result.savingsPerMonth;
  }

  return {
    toolResults,
    totalSavingsMonthly,
    totalSavingsAnnually: totalSavingsMonthly * 12
  };
}
