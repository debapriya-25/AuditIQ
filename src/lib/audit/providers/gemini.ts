import { ProviderRuleEngine, UserToolInput, GlobalInputs, ToolAuditResult } from '../types';
import { PRICING } from '../constants/pricing';
import { createAuditResult, calculateSpend } from '../utils';

export const geminiProvider: ProviderRuleEngine = {
  toolId: 'gemini',
  evaluate(input: UserToolInput, global: GlobalInputs): ToolAuditResult {
    const planLower = input.plan.toLowerCase();
    
    let planPrice = 0;
    if (planLower.includes('advanced') || planLower.includes('ultra')) planPrice = PRICING.gemini.advanced.price;
    
    let currentSpend = input.monthlySpend > 0 ? input.monthlySpend : calculateSpend(planPrice, input.seats);

    if (global.useCase === 'coding' && (planLower.includes('advanced') || planLower.includes('ultra'))) {
      return createAuditResult(
        this.toolId,
        'switch_recommended',
        currentSpend,
        0,
        `Switch to Cursor Pro or GitHub Copilot.`,
        `While Gemini Advanced is good, dedicated AI coding assistants integrate much better with your daily developer workflow.`
      );
    }

    return createAuditResult(
      this.toolId,
      'optimal',
      currentSpend,
      0,
      'Keep current plan.',
      'Your Gemini usage matches expectations.'
    );
  }
};
