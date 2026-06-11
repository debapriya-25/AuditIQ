import { UserToolInput, GlobalInputs, ToolAuditFindings, ToolId } from './types';
import { createAuditResult } from './utils';

/** Human-readable tool names for recommendation copy. */
export const TOOL_DISPLAY_NAMES: Record<ToolId, string> = {
  cursor: 'Cursor',
  github_copilot: 'GitHub Copilot',
  claude: 'Claude',
  chatgpt: 'ChatGPT',
  anthropic_api: 'Anthropic API',
  openai_api: 'OpenAI API',
  gemini: 'Gemini',
  windsurf: 'Windsurf',
  v0: 'v0',
};

/**
 * Seat over-provisioning detector.
 *
 * The single most common (and most invisible) form of AI-tool waste is paying
 * for more seats than there are people on the team. Each surplus seat is valued
 * at the user's *actual* per-seat rate (`currentSpend / seats`), so the saving
 * scales with real monthly spend, the real seat count, and the real team size —
 * never a hardcoded list price.
 *
 * Returns `null` when the subscription is sized at-or-under headcount (i.e. not
 * over-provisioned), or when there isn't enough data to make a defensible claim.
 */
export function buildOverprovisioningFinding(
  input: UserToolInput,
  global: GlobalInputs,
  currentSpend: number
): ToolAuditFindings | null {
  const seats = input.seats;
  const team = global.teamSize;

  if (!Number.isFinite(seats) || !Number.isFinite(team)) return null;
  // Only a strict surplus of seats over people is over-provisioning.
  if (seats <= team || seats <= 0 || team <= 0) return null;
  if (!Number.isFinite(currentSpend) || currentSpend <= 0) return null;

  const surplus = seats - team;
  const perSeat = currentSpend / seats;
  const savings = perSeat * surplus;
  if (savings <= 0.01) return null;

  const name = TOOL_DISPLAY_NAMES[input.toolId];
  const seatWord = surplus === 1 ? 'seat' : 'seats';
  const annual = savings * 12;

  return createAuditResult(
    input.toolId,
    'overspending',
    currentSpend,
    savings,
    `Reduce ${name} from ${seats} to ${team} seats — one per team member. You're paying for ${surplus} unused ${seatWord}.`,
    `${seats} seats for a team of ${team} leaves ${surplus} idle ${seatWord} at ~$${perSeat.toFixed(0)}/seat — about $${savings.toFixed(0)}/mo ($${annual.toFixed(0)}/yr) of pure waste.`
  );
}
