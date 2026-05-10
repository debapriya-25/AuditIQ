import { ProviderRuleEngine, UserToolInput, GlobalInputs, ToolAuditResult } from '../types';
import { PRICING } from '../constants/pricing';
import { createAuditResult, calculateSpend } from '../utils';

export const cursorProvider: ProviderRuleEngine = {
  toolId: 'cursor',
  evaluate(input: UserToolInput, global: GlobalInputs): ToolAuditResult {
    const planLower = input.plan.toLowerCase();
    
    let planPrice = 0;
    if (planLower.includes('pro')) planPrice = PRICING.cursor.pro.price;
    else if (planLower.includes('business')) planPrice = PRICING.cursor.business.price;
    
    let currentSpend = input.monthlySpend > 0 ? input.monthlySpend : calculateSpend(planPrice, input.seats);

    // If writing or data analysis, Cursor might not be the best.
    if (global.useCase === 'writing' || global.useCase === 'research') {
      return createAuditResult(
        this.toolId,
        'switch_recommended',
        currentSpend,
        currentSpend - (20 * input.seats), // Switch to Claude/ChatGPT
        `Switch to Claude Pro or ChatGPT Plus.`,
        `Cursor is a specialized coding IDE. For ${global.useCase}, general chat interfaces offer better features.`
      );
    }

    // Small teams on Business plan
    if (planLower.includes('business') && global.teamSize <= 5) {
      const recommendedSpend = calculateSpend(PRICING.cursor.pro.price, input.seats);
      const savings = currentSpend - recommendedSpend;
      
      return createAuditResult(
        this.toolId,
        'overspending',
        currentSpend,
        savings,
        `Downgrade to Cursor Pro ($20/month/user).`,
        `Business plan adds centralized billing and SSO, which is overkill for teams of 5 or fewer.`
      );
    }
    
    // Solo users on Pro who barely code might be fine on Free, but hard to say without usage metrics. We'll skip that.

    return createAuditResult(
      this.toolId,
      'optimal',
      currentSpend,
      0,
      'Keep current plan.',
      'Your Cursor plan is optimized for your team size and coding needs.'
    );
  }
};
