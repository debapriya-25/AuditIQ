export type UseCase = 'coding' | 'writing' | 'data analysis' | 'research' | 'mixed' | 'data_analysis';

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

export type AuditStatus = 'optimal' | 'overspending' | 'switch_recommended';

export interface UserToolInput {
  toolId: ToolId;
  plan: string;
  seats: number;
  monthlySpend: number;
}

export interface GlobalInputs {
  teamSize: number;
  useCase: UseCase;
}

export interface AuditInput {
  tools: UserToolInput[];
  global: GlobalInputs;
}

export interface ToolSavings {
  toolId: ToolId;
  currentMonthlySpend: string; // Serialized Decimal
  optimalMonthlySpend: string; // Serialized Decimal
  savingsPerMonth: string; // Serialized Decimal
}

export interface ScoreOutputs {
  optimizationScore: number;
  confidenceScore: number;
}

export interface RecommendationMetadata {
  isRedundant: boolean;
  alternativeTool?: ToolId;
  reason: string;
  recommendedAction: string;
}

export interface ToolAuditFindings {
  toolId: ToolId;
  status: AuditStatus;
  savings: ToolSavings;
  recommendation: RecommendationMetadata;
}

export interface FinalAuditResult {
  toolResults: ToolAuditFindings[];
  scores: ScoreOutputs;
  totalSavingsMonthly: string; // Serialized Decimal
  totalSavingsAnnually: string; // Serialized Decimal
}

export interface ProviderRuleEngine {
  toolId: ToolId;
  evaluate(input: UserToolInput, global: GlobalInputs): ToolAuditFindings;
}
