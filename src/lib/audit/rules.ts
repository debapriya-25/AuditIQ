import { UserToolInput, GlobalInputs, ToolId } from './types';

export const rulesEngine = {
  /**
   * Detects overlaps between tools based on use case and redundancy rules.
   * E.g. using both GitHub Copilot and Cursor for coding.
   */
  detectToolOverlap: (tools: UserToolInput[], global: GlobalInputs): Record<ToolId, boolean> => {
    const redundancies: Record<string, boolean> = {};
    const toolIds = new Set(tools.map(t => t.toolId));

    // Overlap Rule 1: Multiple pure coding assistants
    if (toolIds.has('cursor') && toolIds.has('github_copilot')) {
      // Mark github_copilot as redundant in favor of cursor if they have both
      redundancies['github_copilot'] = true;
    }

    // Overlap Rule 2: Multiple conversational LLMs
    if (toolIds.has('claude') && toolIds.has('chatgpt')) {
      // Depending on use case, one might be better. 
      // For coding/writing, Claude is preferred in this audit engine heuristics.
      if (global.useCase === 'coding' || global.useCase === 'writing') {
        redundancies['chatgpt'] = true;
      }
    }

    return redundancies;
  }
};
