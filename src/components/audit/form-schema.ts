import { z } from 'zod';
import type { UseCase } from '@/lib/audit/types';
import {
  getTool,
  getPlan,
  seatsApply,
  USAGE_BASED_PLAN,
  USE_CASE_VALUES,
} from './catalog';

/* ──────────────────────────────────────────────────────
   localStorage key (Phase 6.3 spec)
   ────────────────────────────────────────────────────── */
export const STORAGE_KEY = 'auditiq_form_state';

/* ──────────────────────────────────────────────────────
   Form value shapes
   Numeric inputs are stored as strings so empty fields stay
   empty (no NaN / "0" artefacts). They are parsed + coerced
   at validation and submission time.
   ────────────────────────────────────────────────────── */

export interface ToolRowValues {
  toolId: string;
  plan: string;
  seats: string;
  monthlySpend: string;
}

export interface AuditFormValues {
  teamSize: string;
  useCase: string;
  tools: ToolRowValues[];
  /** Honeypot — must stay empty. */
  website: string;
}

export function emptyToolRow(): ToolRowValues {
  return { toolId: '', plan: '', seats: '', monthlySpend: '' };
}

export function defaultFormValues(): AuditFormValues {
  return {
    teamSize: '',
    useCase: '',
    tools: [emptyToolRow()],
    website: '',
  };
}

/* ──────────────────────────────────────────────────────
   Numeric parsing helpers
   ────────────────────────────────────────────────────── */

/** Parse a string field to a finite number, or `null` when empty/invalid. */
export function parseNumber(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === '') return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

/* ──────────────────────────────────────────────────────
   Validation messages (PRD §4.2)
   ────────────────────────────────────────────────────── */
const MSG = {
  teamSize: 'Enter your team size (minimum 1)',
  useCase: 'Select your primary use case',
  tool: 'Select a tool',
  plan: 'Select a plan',
  seats: 'Enter number of seats (minimum 1)',
  spend: 'Enter your monthly spend',
  spendMax: 'Amount is too large',
} as const;

/* ──────────────────────────────────────────────────────
   Zod schema — all logic lives in superRefine so we control
   every message and the conditional plan/seats rules.
   ────────────────────────────────────────────────────── */

const toolRowSchema = z.object({
  toolId: z.string(),
  plan: z.string(),
  seats: z.string(),
  monthlySpend: z.string(),
});

export const auditFormSchema = z
  .object({
    teamSize: z.string(),
    useCase: z.string(),
    tools: z.array(toolRowSchema).min(1),
    website: z.string(),
  })
  .superRefine((values, ctx) => {
    // ── Team size ──
    const teamSize = parseNumber(values.teamSize);
    if (teamSize === null || !Number.isInteger(teamSize) || teamSize < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['teamSize'],
        message: MSG.teamSize,
      });
    }

    // ── Use case ──
    if (!USE_CASE_VALUES.includes(values.useCase as UseCase)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['useCase'],
        message: MSG.useCase,
      });
    }

    // ── Tool rows ──
    values.tools.forEach((row, i) => {
      const tool = getTool(row.toolId);
      if (!tool) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['tools', i, 'toolId'],
          message: MSG.tool,
        });
        return;
      }

      // Plan + seats only apply to subscription products.
      if (!tool.apiProduct) {
        const plan = getPlan(tool.id, row.plan);
        if (!plan) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['tools', i, 'plan'],
            message: MSG.plan,
          });
        }

        if (seatsApply(tool.id, row.plan)) {
          const seats = parseNumber(row.seats);
          if (seats === null || !Number.isInteger(seats) || seats < 1) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['tools', i, 'seats'],
              message: MSG.seats,
            });
          }
        }
      }

      // Monthly spend is always required (>= 0 — free plans are allowed).
      const spend = parseNumber(row.monthlySpend);
      if (spend === null || spend < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['tools', i, 'monthlySpend'],
          message: MSG.spend,
        });
      } else if (spend > 1_000_000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['tools', i, 'monthlySpend'],
          message: MSG.spendMax,
        });
      }
    });
  });

/* ──────────────────────────────────────────────────────
   API payload mapping — matches `auditInputSchema`
   (src/lib/validators/audit-input.ts). API products carry a
   non-empty plan + seats=1 to satisfy the backend contract.
   ────────────────────────────────────────────────────── */

export interface AuditSubmitPayload {
  tools: {
    toolId: string;
    plan: string;
    seats: number;
    monthlySpend: number;
  }[];
  teamSize: number;
  useCase: UseCase;
  website: string;
}

export function toSubmitPayload(values: AuditFormValues): AuditSubmitPayload {
  return {
    teamSize: parseNumber(values.teamSize) ?? 1,
    useCase: values.useCase as UseCase,
    website: values.website,
    tools: values.tools.map((row) => {
      const tool = getTool(row.toolId);
      const isApi = !!tool?.apiProduct;
      const usesSeats = seatsApply(row.toolId, row.plan);
      return {
        toolId: row.toolId,
        plan: isApi ? USAGE_BASED_PLAN : row.plan,
        seats: usesSeats ? parseNumber(row.seats) ?? 1 : 1,
        monthlySpend: parseNumber(row.monthlySpend) ?? 0,
      };
    }),
  };
}

/** Live running total (monthly USD) summed across the given tool rows. */
export function runningMonthlyTotal(tools: ToolRowValues[]): number {
  return tools.reduce((sum, row) => {
    const spend = parseNumber(row.monthlySpend);
    return spend !== null && spend > 0 ? sum + spend : sum;
  }, 0);
}

/* ──────────────────────────────────────────────────────
   localStorage persistence (resilient to private-mode)
   ────────────────────────────────────────────────────── */

function isToolRow(value: unknown): value is ToolRowValues {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.toolId === 'string' &&
    typeof v.plan === 'string' &&
    typeof v.seats === 'string' &&
    typeof v.monthlySpend === 'string'
  );
}

function isAuditFormValues(value: unknown): value is AuditFormValues {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.teamSize === 'string' &&
    typeof v.useCase === 'string' &&
    typeof v.website === 'string' &&
    Array.isArray(v.tools) &&
    v.tools.every(isToolRow)
  );
}

/** Load a persisted draft. Returns `null` when absent, corrupt, or unavailable. */
export function loadDraft(): AuditFormValues | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isAuditFormValues(parsed)) return null;
    if (parsed.tools.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveDraft(values: AuditFormValues): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  } catch {
    /* private mode / quota — persistence silently disabled */
  }
}

export function clearDraft(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* no-op */
  }
}

/** A draft counts as "meaningful" (worth restoring) if any field is filled. */
export function isMeaningfulDraft(values: AuditFormValues): boolean {
  if (values.teamSize.trim() !== '' || values.useCase.trim() !== '') return true;
  return values.tools.some(
    (row) =>
      row.toolId.trim() !== '' ||
      row.plan.trim() !== '' ||
      row.seats.trim() !== '' ||
      row.monthlySpend.trim() !== ''
  );
}
