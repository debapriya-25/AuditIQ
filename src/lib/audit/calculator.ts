import { Decimal } from 'decimal.js';
import { ToolSavings, ToolAuditFindings, FinalAuditResult } from './types';

// Enforce uniform configuration across the calculation layer
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export const calculator = {
  /**
   * Calculates monthly savings for a specific tool.
   * Uses decimal.js to prevent floating point inaccuracies.
   */
  calculateToolSavings: (currentSpend: number, optimalSpend: number): string => {
    const current = new Decimal(currentSpend);
    const optimal = new Decimal(optimalSpend);
    let savings = current.minus(optimal);
    
    // Ensure savings cannot be negative
    if (savings.isNegative()) {
      savings = new Decimal(0);
    }
    
    return savings.toFixed(2);
  },

  /**
   * Aggregates total monthly savings across all evaluated tools.
   */
  aggregateMonthlySavings: (toolResults: ToolAuditFindings[]): string => {
    const total = toolResults.reduce((acc, result) => {
      return acc.plus(new Decimal(result.savings.savingsPerMonth));
    }, new Decimal(0));
    
    return total.toFixed(2);
  },

  /**
   * Calculates annual savings given the monthly total.
   */
  calculateYearlySavings: (monthlySavings: string): string => {
    const monthly = new Decimal(monthlySavings);
    return monthly.times(12).toFixed(2);
  }
};
