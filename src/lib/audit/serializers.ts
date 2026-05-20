import { ToolAuditFindings, FinalAuditResult, ScoreOutputs } from './types';
import { calculator } from './calculator';

export const serializers = {
  /**
   * Safely formats the internal engine results into the strict output DTO.
   * Ensures all money types are correctly formatted strings.
   */
  serializeAuditResult: (
    toolResults: ToolAuditFindings[],
    scores: ScoreOutputs
  ): FinalAuditResult => {
    const totalSavingsMonthly = calculator.aggregateMonthlySavings(toolResults);
    const totalSavingsAnnually = calculator.calculateYearlySavings(totalSavingsMonthly);

    return {
      toolResults,
      scores,
      totalSavingsMonthly,
      totalSavingsAnnually,
    };
  }
};
