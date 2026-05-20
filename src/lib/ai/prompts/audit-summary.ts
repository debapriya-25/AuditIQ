import { AuditSelect } from '../../repositories/audit';
import { AuditInputPayload } from '../../validators/audit-input';
import { ToolAuditFindings } from '../../audit/types';

export function buildAuditSummaryPrompt(
  audit: AuditSelect, 
  findings: Record<string, ToolAuditFindings>
): string {
  // Use explicit casting as the payload was validated on ingest
  const auditData = audit.auditData as AuditInputPayload;

  // Compress the context to strictly necessary data
  const context = {
    teamSize: auditData.teamSize,
    useCase: audit.useCase,
    totalMonthlySpend: auditData.tools.reduce((acc, t) => acc + t.monthlySpend, 0),
    totalMonthlySavings: audit.totalSavingsMonthly,
    toolsEvaluated: auditData.tools.map(t => t.toolId),
    keyFindings: Object.values(findings).map(f => ({
      tool: f.toolId,
      status: f.status,
      action: f.recommendation.recommendedAction,
      savings: f.savings.savingsPerMonth,
      reason: f.recommendation.reason,
    })),
  };

  return JSON.stringify(context, null, 2);
}
