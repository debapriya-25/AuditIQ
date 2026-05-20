import { ProviderRuleEngine, UserToolInput, GlobalInputs, ToolAuditFindings } from '../types';
import { createAuditResult } from '../utils';

export const anthropicApiProvider: ProviderRuleEngine = {
  toolId: 'anthropic_api',
  evaluate(input: UserToolInput, global: GlobalInputs): ToolAuditFindings {
    const currentSpend = input.monthlySpend;

    if (currentSpend > 200) {
      return createAuditResult(
        this.toolId,
        'overspending',
        currentSpend,
        0, // No specific savings amount without usage data
        `Review API usage and consider volume discounts.`,
        `Your API spend is over $200/mo. Ensure you aren't using expensive models (like Opus) for tasks where Haiku or Sonnet would suffice.`
      );
    }

    return createAuditResult(
      this.toolId,
      'optimal',
      currentSpend,
      0,
      'Keep current usage.',
      'API spending appears reasonable and usage-based.'
    );
  }
};
