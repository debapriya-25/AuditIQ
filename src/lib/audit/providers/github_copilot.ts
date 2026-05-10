import { ProviderRuleEngine, UserToolInput, GlobalInputs, ToolAuditResult } from '../types';
import { PRICING } from '../constants/pricing';
import { createAuditResult, calculateSpend } from '../utils';

export const githubCopilotProvider: ProviderRuleEngine = {
  toolId: 'github_copilot',
  evaluate(input: UserToolInput, global: GlobalInputs): ToolAuditResult {
    const planLower = input.plan.toLowerCase();
    let currentSpend = input.monthlySpend;

    // Standardize spend calculation if user input is weird, but usually trust input spend or calculate based on plan.
    if (planLower === 'business' || planLower === 'enterprise') {
      const price = PRICING.github_copilot[planLower as keyof typeof PRICING.github_copilot]?.price || 19;
      currentSpend = calculateSpend(price, input.seats);
    } else {
      currentSpend = calculateSpend(PRICING.github_copilot.individual.price, input.seats);
    }

    // Rule 1: Small teams on Business
    if ((planLower === 'business' || planLower === 'enterprise') && global.teamSize <= 5) {
      const recommendedPlanPrice = PRICING.github_copilot.individual.price;
      const recommendedSpend = calculateSpend(recommendedPlanPrice, input.seats);
      const savings = currentSpend - recommendedSpend;

      return createAuditResult(
        this.toolId,
        'overspending',
        currentSpend,
        savings,
        `Downgrade to Individual ($10/month flat).`,
        `Business plan adds SSO and audit logs — unnecessary for teams under 5.`
      );
    }

    // Rule 2: Wrong use case
    if (global.useCase === 'writing' || global.useCase === 'research') {
      return createAuditResult(
        this.toolId,
        'switch_recommended',
        currentSpend,
        currentSpend - (PRICING.claude.pro.price * input.seats), // Switch to Claude Pro
        `Switch to Claude Pro or ChatGPT Plus.`,
        `GitHub Copilot is optimized for coding, not ${global.useCase}. You can get better results with general-purpose models.`
      );
    }

    return createAuditResult(
      this.toolId,
      'optimal',
      currentSpend,
      0,
      'Keep current plan.',
      'Your GitHub Copilot plan matches your team size and use case.'
    );
  }
};
