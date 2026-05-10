export type UseCase = 'coding' | 'writing' | 'data analysis' | 'research' | 'mixed';

export type ToolId = 
  | 'cursor'
  | 'github_copilot'
  | 'claude'
  | 'chatgpt'
  | 'anthropic_api'
  | 'openai_api'
  | 'gemini'
  | 'windsurf'
  | 'v0';

export interface UserToolInput {
  toolId: ToolId;
  plan: string;
  seats: number;
  monthlySpend: number; // For API tools, user might provide a custom value
}

export interface GlobalInputs {
  teamSize: number;
  useCase: UseCase;
}

export interface AuditInput {
  tools: UserToolInput[];
  global: GlobalInputs;
}

export type AuditStatus = 'optimal' | 'overspending' | 'switch_recommended';

export interface ToolAuditResult {
  toolId: ToolId;
  status: AuditStatus;
  currentMonthlySpend: number;
  recommendedAction: string;
  savingsPerMonth: number;
  reason: string;
}

export interface AuditResult {
  toolResults: ToolAuditResult[];
  totalSavingsMonthly: number;
  totalSavingsAnnually: number;
}

export interface ProviderRuleEngine {
  toolId: ToolId;
  evaluate(input: UserToolInput, global: GlobalInputs): ToolAuditResult;
}
