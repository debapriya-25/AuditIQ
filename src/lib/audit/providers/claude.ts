import { ProviderRuleEngine, UserToolInput, GlobalInputs, ToolAuditFindings } from '../types';
import { PRICING } from '../constants/pricing';
import { createAuditResult, calculateSpend } from '../utils';

export const claudeProvider: ProviderRuleEngine = {
  toolId: 'claude',
  evaluate(input: UserToolInput, global: GlobalInputs): ToolAuditFindings {
    const planLower = input.plan.toLowerCase();
    
    let planPrice = 0;
    if (planLower.includes('pro')) planPrice = PRICING.claude.pro.price;
    else if (planLower.includes('team')) planPrice = PRICING.claude.team.price;
    
    let currentSpend = input.monthlySpend > 0 ? input.monthlySpend : calculateSpend(planPrice, input.seats);

    // Rule 0: Claude Max ($100/seat) is for power users needing 5x usage limits.
    // For a whole team it's almost always over-spec vs Pro ($20/seat).
    if (planLower.includes('max')) {
      const proSpend = calculateSpend(PRICING.claude.pro.price, input.seats);
      const savings = currentSpend - proSpend;
      if (savings > 0) {
        return createAuditResult(
          this.toolId,
          'overspending',
          currentSpend,
          savings,
          `Downgrade most Claude Max seats to Pro ($20/user/month).`,
          `Claude Max ($100/seat) is built for power users who hit Pro's limits. For a team of ${global.teamSize}, Pro covers typical usage at a fraction of the cost.`
        );
      }
    }

    // Rule 1: Small team on Team plan
    if (planLower.includes('team') && input.seats < 5 && global.teamSize < 5) {
      // Claude Team has a 5 seat minimum, so if they are paying for it but have < 5 team size, they might be overpaying for empty seats.
      // E.g. team of 3 paying for 5 seats at $30/mo = $150. Pro would be 3 * $20 = $60.
      const recommendedSpend = calculateSpend(PRICING.claude.pro.price, input.seats);
      const actualTeamSpend = Math.max(5, input.seats) * PRICING.claude.team.price; // At least $150
      currentSpend = Math.max(currentSpend, actualTeamSpend);
      
      const savings = currentSpend - recommendedSpend;
      
      return createAuditResult(
        this.toolId,
        'overspending',
        currentSpend,
        savings,
        `Downgrade to Claude Pro ($20/user/month).`,
        `Claude Team has a 5-seat minimum ($150/mo). For your team size, individual Pro accounts are much cheaper.`
      );
    }
    
    // Rule 2: Pure coding use case should consider IDEs instead of web UI
    if (global.useCase === 'coding' && (planLower.includes('pro') || planLower.includes('team'))) {
      const cursorPrice = PRICING.cursor.pro.price;
      // It's the same price ($20 vs $20), so savings is 0, but it's a switch recommendation.
      return createAuditResult(
        this.toolId,
        'switch_recommended',
        currentSpend,
        0,
        `Switch to Cursor Pro or Windsurf.`,
        `For purely coding, an AI-native IDE provides a much better workflow than copying and pasting into a chat interface.`
      );
    }

    return createAuditResult(
      this.toolId,
      'optimal',
      currentSpend,
      0,
      'Keep current plan.',
      'Your Claude plan is well-suited for your usage and team size.'
    );
  }
};
