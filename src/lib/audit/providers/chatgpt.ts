import { ProviderRuleEngine, UserToolInput, GlobalInputs, ToolAuditResult } from '../types';
import { PRICING } from '../constants/pricing';
import { createAuditResult, calculateSpend } from '../utils';

export const chatgptProvider: ProviderRuleEngine = {
  toolId: 'chatgpt',
  evaluate(input: UserToolInput, global: GlobalInputs): ToolAuditResult {
    const planLower = input.plan.toLowerCase();
    
    let planPrice = 0;
    if (planLower.includes('plus')) planPrice = PRICING.chatgpt.plus.price;
    else if (planLower.includes('team')) planPrice = PRICING.chatgpt.team.price;
    
    let currentSpend = input.monthlySpend > 0 ? input.monthlySpend : calculateSpend(planPrice, input.seats);

    // Rule 1: Small team on Team plan
    if (planLower.includes('team') && input.seats < 3 && global.teamSize < 3) {
      // ChatGPT Team is $30/mo per seat, min 2 seats = $60.
      // If a solo user bought Team, they pay $60. Pro is $20.
      const recommendedSpend = calculateSpend(PRICING.chatgpt.plus.price, input.seats);
      const actualTeamSpend = Math.max(2, input.seats) * PRICING.chatgpt.team.price; 
      currentSpend = Math.max(currentSpend, actualTeamSpend);
      
      const savings = currentSpend - recommendedSpend;
      
      if (savings > 0) {
        return createAuditResult(
          this.toolId,
          'overspending',
          currentSpend,
          savings,
          `Downgrade to ChatGPT Plus ($20/user/month).`,
          `ChatGPT Team requires 2 seats minimum. For individuals, Plus is sufficient and cheaper.`
        );
      }
    }

    // Rule 2: Pure coding use case
    if (global.useCase === 'coding' && (planLower.includes('plus') || planLower.includes('team'))) {
      return createAuditResult(
        this.toolId,
        'switch_recommended',
        currentSpend,
        0,
        `Switch to Cursor Pro or GitHub Copilot.`,
        `For dedicated coding, AI-native IDEs or editor extensions provide significantly more value than web chat.`
      );
    }

    return createAuditResult(
      this.toolId,
      'optimal',
      currentSpend,
      0,
      'Keep current plan.',
      'Your ChatGPT plan matches your requirements perfectly.'
    );
  }
};
