import { ProviderRuleEngine, UserToolInput, GlobalInputs, ToolAuditResult } from '../types';
import { PRICING } from '../constants/pricing';
import { createAuditResult, calculateSpend } from '../utils';

export const windsurfProvider: ProviderRuleEngine = {
  toolId: 'windsurf',
  evaluate(input: UserToolInput, global: GlobalInputs): ToolAuditResult {
    const planLower = input.plan.toLowerCase();
    
    let planPrice = 0;
    if (planLower.includes('pro')) planPrice = PRICING.windsurf.pro.price;
    
    let currentSpend = input.monthlySpend > 0 ? input.monthlySpend : calculateSpend(planPrice, input.seats);

    if (global.useCase === 'writing' || global.useCase === 'research') {
      return createAuditResult(
        this.toolId,
        'switch_recommended',
        currentSpend,
        currentSpend - (PRICING.claude.pro.price * input.seats),
        `Switch to Claude Pro.`,
        `Windsurf is an AI IDE. If your main use case is ${global.useCase}, you are paying for features you won't use.`
      );
    }

    return createAuditResult(
      this.toolId,
      'optimal',
      currentSpend,
      0,
      'Keep current plan.',
      'Windsurf is an excellent choice for a dedicated AI coding assistant.'
    );
  }
};
