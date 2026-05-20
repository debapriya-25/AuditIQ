import { AISummaryResponse } from './schemas/summary';

/**
 * Normalizes and formats the validated AI summary for the frontend.
 * Enforces string cleanup and bounds on the output.
 */
export function serializeAISummary(data: AISummaryResponse): string {
  let text = data.summary.trim();
  
  // Basic sanity check to prevent gigantic wall-of-text leakage
  if (text.length > 800) {
    text = text.substring(0, 797) + '...';
  }

  return text;
}

/**
 * Generates a completely deterministic, non-AI fallback summary in case of complete provider failure.
 */
export function generateFallbackSummary(totalSavings: number): string {
  if (totalSavings > 0) {
    return `Your audit is complete. We identified $${totalSavings} in potential monthly savings by optimizing your tool allocations and switching to more cost-effective plans. Review the itemized breakdown below for specific recommendations.`;
  } else {
    return 'Your audit is complete. Your current AI tool stack is fully optimized for your team size and use case. No immediate changes are recommended.';
  }
}
