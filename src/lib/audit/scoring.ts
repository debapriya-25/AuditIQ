import { ToolAuditFindings, ScoreOutputs, GlobalInputs } from './types';
import { Decimal } from 'decimal.js';

export const scoring = {
  /**
   * Calculates the optimization score for the overall audit.
   * A 100 means they are fully optimized (0 savings possible).
   * A 0 means 100% of their spend is wasted.
   */
  calculateOptimizationScore: (toolResults: ToolAuditFindings[]): number => {
    if (toolResults.length === 0) return 100;

    let totalSpend = new Decimal(0);
    let totalSavings = new Decimal(0);

    for (const result of toolResults) {
      totalSpend = totalSpend.plus(new Decimal(result.savings.currentMonthlySpend));
      totalSavings = totalSavings.plus(new Decimal(result.savings.savingsPerMonth));
    }

    if (totalSpend.isZero()) return 100;

    // optimization % = (1 - (savings / spend)) * 100
    const savingsRatio = totalSavings.dividedBy(totalSpend);
    const score = new Decimal(1).minus(savingsRatio).times(100).round();
    
    return Math.max(0, Math.min(100, score.toNumber()));
  },

  /**
   * Calculates a confidence score based on the input data completeness
   * and any potential overlaps detected.
   */
  calculateConfidenceScore: (toolResults: ToolAuditFindings[], global: GlobalInputs): number => {
    let score = 100;

    // Deduct confidence if the team size is unusually large but tools are very few
    if (global.teamSize > 50 && toolResults.length === 1) {
      score -= 20;
    }

    return Math.max(0, score);
  }
};
