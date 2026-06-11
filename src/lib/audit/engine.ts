import { AuditInput, FinalAuditResult, ToolAuditFindings, ToolId } from './types';
import { providers } from './providers';
import { rulesEngine } from './rules';
import { scoring } from './scoring';
import { serializers } from './serializers';
import { calculator } from './calculator';
import { buildOverprovisioningFinding } from './heuristics';

function formatFindingSpend(finding: ToolAuditFindings): void {
  finding.savings.currentMonthlySpend = Number(finding.savings.currentMonthlySpend).toFixed(2);
  finding.savings.optimalMonthlySpend = Number(finding.savings.optimalMonthlySpend).toFixed(2);
  finding.savings.savingsPerMonth = Number(finding.savings.savingsPerMonth).toFixed(2);
}

/**
 * Master Audit Engine Orchestrator
 * PURE business calculation engine only. No DB, no HTTP, no AI.
 */
export function runAuditEngine(input: AuditInput): FinalAuditResult {
  const toolResults: ToolAuditFindings[] = [];

  // 1. Evaluate cross-tool overlaps
  const overlaps = rulesEngine.detectToolOverlap(input.tools, input.global);

  // 2. Evaluate each tool
  for (const toolInput of input.tools) {
    const provider = providers[toolInput.toolId];
    
    // Default fallback for unknown tool
    if (!provider) {
      toolResults.push({
        toolId: toolInput.toolId as ToolId,
        status: 'optimal',
        savings: {
          toolId: toolInput.toolId as ToolId,
          currentMonthlySpend: calculator.calculateToolSavings(toolInput.monthlySpend, 0), // fallback format
          optimalMonthlySpend: calculator.calculateToolSavings(toolInput.monthlySpend, 0),
          savingsPerMonth: '0.00',
        },
        recommendation: {
          isRedundant: false,
          reason: 'Tool not currently supported by the advanced engine.',
          recommendedAction: 'No specific recommendations available.',
        }
      });
      continue;
    }

    // Pass through provider engine
    let result = provider.evaluate(toolInput, input.global);

    // Format the result properly through calculator to ensure decimals are standard
    formatFindingSpend(result);

    // Apply overlap rules — only when the provider found nothing more specific.
    // A concrete per-tool saving (e.g. "downgrade to Individual") is more
    // actionable and defensible than a blanket "cancel for redundancy", so we
    // never let redundancy clobber an existing recommendation.
    if (overlaps[toolInput.toolId] && result.status === 'optimal') {
      result.status = 'switch_recommended';
      result.recommendation.isRedundant = true;
      result.recommendation.reason = 'This tool overlaps significantly with another tool you are paying for.';
      result.recommendation.recommendedAction = 'Cancel this subscription to eliminate redundancy.';

      // If redundant, full spend is savings
      result.savings.optimalMonthlySpend = '0.00';
      result.savings.savingsPerMonth = result.savings.currentMonthlySpend;
    }

    // Universal over-provisioning correction.
    // Every provider has its own narrow plan/use-case heuristics, but none of
    // them compare seats to headcount. Detect seat surplus centrally and surface
    // it whenever it is the *dominant* saving — this is what stops realistic,
    // larger-team audits from collapsing to a generic "optimal" verdict.
    const overprovision = buildOverprovisioningFinding(
      toolInput,
      input.global,
      Number(result.savings.currentMonthlySpend)
    );
    if (
      overprovision &&
      Number(overprovision.savings.savingsPerMonth) > Number(result.savings.savingsPerMonth)
    ) {
      formatFindingSpend(overprovision);
      result = overprovision;
    }

    toolResults.push(result);
  }

  // 3. Compute Scores
  const scores = {
    optimizationScore: scoring.calculateOptimizationScore(toolResults),
    confidenceScore: scoring.calculateConfidenceScore(toolResults, input.global),
  };

  // 4. Serialize and return final deterministic output
  return serializers.serializeAuditResult(toolResults, scores);
}
