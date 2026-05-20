import { ToolAuditFindings, AuditStatus, ToolId } from './types';
import { calculator } from './calculator';

export function createAuditResult(
  toolId: ToolId,
  status: AuditStatus,
  currentMonthlySpend: number,
  savingsPerMonth: number,
  recommendedAction: string,
  reason: string
): ToolAuditFindings {
  const current = currentMonthlySpend;
  const savings = savingsPerMonth;
  const optimal = current - savings; // Simplified inference

  return {
    toolId,
    status,
    savings: {
      toolId,
      currentMonthlySpend: current.toString(),
      optimalMonthlySpend: optimal.toString(),
      savingsPerMonth: savings.toString(),
    },
    recommendation: {
      isRedundant: false,
      reason,
      recommendedAction,
    }
  };
}

export function calculateSpend(pricePerSeat: number, seats: number): number {
  return pricePerSeat * Math.max(1, seats);
}
