import type { ToolId, UseCase } from '@/lib/audit/types';

/**
 * Audit form catalog — UI-layer source of truth for the supported tools, their
 * plan matrices, and list prices used for the "suggested monthly spend" helper.
 *
 * This is a FRONTEND-ONLY catalog. It never overrides the deterministic audit
 * engine: the engine recomputes savings from the submitted `monthlySpend`. The
 * list prices here only seed a *suggestion* the user can override, and the plan
 * `value`s are the canonical strings the backend engine substring-matches
 * (e.g. it lowercases the plan and checks `.includes('pro')`).
 *
 * Prices follow the PRD plan matrix (APPFLOW §4.2). Where a price is custom
 * (Enterprise) or usage-based (API) we omit it and let the user enter spend.
 */

/** The 8 tools accepted by the audit-input validator (`v0` is intentionally excluded). */
export type FormToolId = Exclude<ToolId, 'v0'>;

export interface PlanOption {
  /** Canonical value sent to the API; engine matches this case-insensitively. */
  value: string;
  /** Human-readable label shown in the plan selector. */
  label: string;
  /** Per-seat monthly list price (USD) — used to seed suggested spend. */
  pricePerSeat?: number;
  /** Flat monthly list price (USD), independent of seats (e.g. Copilot Individual). */
  flatPrice?: number;
  /** Custom / "contact sales" pricing — no spend is suggested. */
  custom?: boolean;
  /** Usage-based plan (e.g. Gemini API) — hides seats, free-form spend entry. */
  usageBased?: boolean;
}

export interface ToolDefinition {
  id: FormToolId;
  name: string;
  /** Whole product is usage-based (Anthropic / OpenAI API). No plan, no seats. */
  apiProduct?: boolean;
  plans: PlanOption[];
}

/** Plan value used for usage-based API products that still require a non-empty plan. */
export const USAGE_BASED_PLAN = 'usage-based';

export const TOOLS: ToolDefinition[] = [
  {
    id: 'cursor',
    name: 'Cursor',
    plans: [
      { value: 'hobby', label: 'Hobby (Free)', flatPrice: 0 },
      { value: 'pro', label: 'Pro', pricePerSeat: 20 },
      { value: 'business', label: 'Business', pricePerSeat: 40 },
      { value: 'enterprise', label: 'Enterprise', custom: true },
    ],
  },
  {
    id: 'github_copilot',
    name: 'GitHub Copilot',
    plans: [
      { value: 'individual', label: 'Individual', flatPrice: 10 },
      { value: 'business', label: 'Business', pricePerSeat: 19 },
      { value: 'enterprise', label: 'Enterprise', pricePerSeat: 39 },
    ],
  },
  {
    id: 'claude',
    name: 'Claude',
    plans: [
      { value: 'free', label: 'Free', flatPrice: 0 },
      { value: 'pro', label: 'Pro', pricePerSeat: 20 },
      { value: 'max', label: 'Max', pricePerSeat: 100 },
      { value: 'team', label: 'Team', pricePerSeat: 30 },
      { value: 'enterprise', label: 'Enterprise', custom: true },
    ],
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    plans: [
      { value: 'plus', label: 'Plus', pricePerSeat: 20 },
      { value: 'team', label: 'Team', pricePerSeat: 30 },
      { value: 'enterprise', label: 'Enterprise', custom: true },
    ],
  },
  {
    id: 'anthropic_api',
    name: 'Anthropic API',
    apiProduct: true,
    plans: [],
  },
  {
    id: 'openai_api',
    name: 'OpenAI API',
    apiProduct: true,
    plans: [],
  },
  {
    id: 'gemini',
    name: 'Gemini',
    plans: [
      { value: 'pro', label: 'Pro', pricePerSeat: 19.99 },
      { value: 'ultra', label: 'Ultra', pricePerSeat: 29.99 },
      { value: 'api', label: 'API (usage-based)', usageBased: true },
    ],
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    plans: [
      { value: 'free', label: 'Free', flatPrice: 0 },
      { value: 'pro', label: 'Pro', pricePerSeat: 15 },
      { value: 'teams', label: 'Teams', pricePerSeat: 35 },
      { value: 'enterprise', label: 'Enterprise', custom: true },
    ],
  },
];

/** Max number of tool rows == number of supported tools. */
export const MAX_TOOLS = TOOLS.length;

const TOOL_BY_ID = new Map<string, ToolDefinition>(TOOLS.map((t) => [t.id, t]));

export function getTool(id: string): ToolDefinition | undefined {
  return TOOL_BY_ID.get(id);
}

export function getPlan(
  toolId: string,
  planValue: string
): PlanOption | undefined {
  return getTool(toolId)?.plans.find((p) => p.value === planValue);
}

/** Whether a row should show the seats input (subscription tools, non-usage plans). */
export function seatsApply(toolId: string, planValue: string): boolean {
  const tool = getTool(toolId);
  if (!tool || tool.apiProduct) return false;
  const plan = tool.plans.find((p) => p.value === planValue);
  return !!plan && !plan.usageBased;
}

/**
 * Suggested monthly spend (USD) for a row, or `null` when no suggestion can be
 * made (custom pricing, usage-based, or unknown plan). Rounded to cents.
 */
export function suggestedMonthlySpend(
  toolId: string,
  planValue: string,
  seats: number
): number | null {
  const plan = getPlan(toolId, planValue);
  if (!plan || plan.custom || plan.usageBased) return null;
  if (typeof plan.flatPrice === 'number') return plan.flatPrice;
  if (typeof plan.pricePerSeat === 'number') {
    const effectiveSeats = Number.isFinite(seats) && seats > 0 ? seats : 1;
    return Math.round(plan.pricePerSeat * effectiveSeats * 100) / 100;
  }
  return null;
}

/** Segmented use-case options. `value` matches the audit-input validator enum. */
export const USE_CASES: { value: UseCase; label: string }[] = [
  { value: 'coding', label: 'Coding' },
  { value: 'writing', label: 'Writing' },
  { value: 'research', label: 'Research' },
  { value: 'data_analysis', label: 'Data Analysis' },
  { value: 'mixed', label: 'Mixed' },
];

export const USE_CASE_VALUES = USE_CASES.map((u) => u.value);
