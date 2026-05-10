import { ProviderRuleEngine, UserToolInput, GlobalInputs, ToolAuditResult } from '../types';
import { createAuditResult } from '../utils';

export const openaiApiProvider: ProviderRuleEngine = {
  toolId: 'openai_api',
  evaluate(input: UserToolInput, global: GlobalInputs): ToolAuditResult {
    const currentSpend = input.monthlySpend;

    if (currentSpend > 200) {
      return createAuditResult(
        this.toolId,
        'overspending',
        currentSpend,
        0,
        `Review API usage and model selection.`,
        `At >$200/mo, ensure you are utilizing GPT-4o-mini instead of GPT-4o for simpler tasks to reduce costs.`
      );
    }

    return createAuditResult(
      this.toolId,
      'optimal',
      currentSpend,
      0,
      'Keep current usage.',
      'API spending is within normal startup parameters.'
    );
  }
};
