import { ToolAuditResult, AuditStatus } from './types';

export function createAuditResult(
  toolId: any,
  status: AuditStatus,
  currentMonthlySpend: number,
  savingsPerMonth: number,
  recommendedAction: string,
  reason: string
): ToolAuditResult {
  return {
    toolId,
    status,
    currentMonthlySpend,
    savingsPerMonth,
    recommendedAction,
    reason,
  };
}

export function calculateSpend(pricePerSeat: number, seats: number): number {
  return pricePerSeat * Math.max(1, seats);
}
