import { ProviderRuleEngine, UserToolInput, GlobalInputs, ToolAuditFindings } from '../types';
import { PRICING } from '../constants/pricing';
import { createAuditResult, calculateSpend } from '../utils';

export const v0Provider: ProviderRuleEngine = {
  toolId: 'v0',
  evaluate(input: UserToolInput, global: GlobalInputs): ToolAuditFindings {
    const planLower = input.plan.toLowerCase();
    
    let planPrice = 0;
    if (planLower.includes('premium')) planPrice = PRICING.v0.premium.price;
    
    let currentSpend = input.monthlySpend > 0 ? input.monthlySpend : calculateSpend(planPrice, input.seats);

    if (global.useCase !== 'coding' && global.useCase !== 'mixed') {
      return createAuditResult(
        this.toolId,
        'switch_recommended',
        currentSpend,
        currentSpend, // 100% savings if they just stop using it, or switch cost?
        `Cancel v0 subscription.`,
        `v0 is purely for UI engineering and code generation. It is entirely unnecessary for ${global.useCase}.`
      );
    }

    return createAuditResult(
      this.toolId,
      'optimal',
      currentSpend,
      0,
      'Keep current plan.',
      'v0 is a strong tool for rapid UI prototyping and React development.'
    );
  }
};
