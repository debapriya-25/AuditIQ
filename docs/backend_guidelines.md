# backend_guidelines.md — AI Spend Audit Tool
### Backend Architecture & Implementation Guidelines

**Version:** 1.0  
**Project:** AI Spend Audit — Credex Web Dev Intern Assignment  
**Stack:** Next.js 14 API Routes · TypeScript · Supabase (Postgres) · Drizzle ORM · Upstash Redis · Resend · Anthropic SDK · Pino  
**Last Updated:** 2026-05-07

---

## Table of Contents

1. [Backend Philosophy](#1-backend-philosophy)
2. [Architecture Overview](#2-architecture-overview)
3. [Directory & File Structure](#3-directory--file-structure)
4. [Database Design](#4-database-design)
5. [API Routes Specification](#5-api-routes-specification)
6. [Audit Engine](#6-audit-engine)
7. [AI Summary Generation](#7-ai-summary-generation)
8. [Email System](#8-email-system)
9. [Rate Limiting & Abuse Protection](#9-rate-limiting--abuse-protection)
10. [Shareable URL & OG Image Generation](#10-shareable-url--og-image-generation)
11. [Input Validation](#11-input-validation)
12. [Error Handling Strategy](#12-error-handling-strategy)
13. [Logging](#13-logging)
14. [Environment Variables & Secrets](#14-environment-variables--secrets)
15. [Testing Requirements](#15-testing-requirements)
16. [Performance & Scalability Notes](#16-performance--scalability-notes)
17. [Security Rules](#17-security-rules)
18. [Implementation Checklist](#18-implementation-checklist)

---

## 1. Backend Philosophy

### Guiding Principles

These principles govern every backend decision in this project. When in doubt, refer back to them.

**1. Serverless-first, zero ops.**  
All backend logic lives in Next.js API routes (`/app/api/*`), deployed as Vercel serverless functions. There is no standalone server, no Docker container, no process manager. Each function is stateless and self-contained.

**2. The audit engine is sacred — no AI in the math.**  
Savings calculations are pure deterministic TypeScript functions. They produce the same output for the same input, every time. AI (the Anthropic API) generates only the narrative summary paragraph — never a number, never a recommendation. This is non-negotiable. Evaluators will check this.

**3. Type safety end-to-end.**  
Every API route has typed request and response shapes defined with Zod. Every database query returns typed results via Drizzle ORM's inferred types. No `any`, no `unknown` without explicit assertion and comment.

**4. Fail gracefully, never fail silently.**  
Every external call (Supabase, Anthropic, Resend, Upstash) is wrapped in try/catch. Failures are logged. The user always sees a meaningful fallback — never a blank screen or a raw error stack.

**5. Free tier is the deployment target.**  
Every service has been chosen for its generous free tier. Write with that constraint in mind: avoid N+1 queries, avoid redundant API calls, avoid polling loops.

**6. Never manufacture savings.**  
If a user is already on the optimal plan, the audit engine must say so. Zero savings is a valid output. Integrity of the audit is the product's entire value proposition.

---

## 2. Architecture Overview

### Request Flow Diagram

```
Browser
  │
  ├── POST /api/audit/submit
  │     ├── Zod validation (input shape)
  │     ├── Rate limit check (Upstash Redis)
  │     ├── Audit engine (pure TypeScript)
  │     ├── Save to Supabase (audits table)
  │     └── Return { auditId, results, totalSavings }
  │
  ├── GET /api/audit/summary?auditId=xxx
  │     ├── Fetch audit from Supabase
  │     ├── Call Anthropic API (claude-sonnet-4-20250514)
  │     ├── Log prompt + sanitized response (Pino)
  │     └── Return { summary: string } or { summary: fallback }
  │
  ├── POST /api/leads/capture
  │     ├── Zod validation (email required)
  │     ├── Idempotency check (auditId + email already exists?)
  │     ├── Insert to Supabase (leads table)
  │     ├── Send confirmation email via Resend
  │     └── Return { success: true }
  │
  └── GET /api/og?auditId=xxx
        ├── Fetch audit from Supabase
        └── Generate OG image via @vercel/og Edge Runtime
```

### Services Map

| Service | Role | Free Tier Limit |
|---|---|---|
| Vercel | Hosting + serverless functions | 100GB bandwidth, 100k function invocations/day |
| Supabase | PostgreSQL database | 500MB storage, 2GB data transfer/month |
| Upstash Redis | Rate limiting | 10,000 requests/day |
| Anthropic API | AI summary generation (claude-sonnet-4-20250514) | Pay-per-use (budget: ~$5 for MVP) |
| Resend | Transactional email | 3,000 emails/month |
| GitHub Actions | CI/CD | Unlimited for public repos |

---

## 3. Directory & File Structure

All backend code lives inside `src/`. No code outside `src/` except config files at root.

```
src/
├── app/
│   └── api/
│       ├── audit/
│       │   ├── submit/
│       │   │   └── route.ts          ← POST: run audit, save to DB
│       │   └── summary/
│       │       └── route.ts          ← GET: generate AI summary
│       ├── leads/
│       │   └── capture/
│       │       └── route.ts          ← POST: save lead, send email
│       └── og/
│           └── route.tsx             ← GET: generate OG image (Edge Runtime)
│
├── lib/
│   ├── audit/
│   │   ├── engine.ts                 ← Master audit runner (calls all tool rules)
│   │   ├── rules/
│   │   │   ├── cursor.ts             ← Cursor-specific rules
│   │   │   ├── github-copilot.ts     ← GitHub Copilot rules
│   │   │   ├── claude.ts             ← Claude / Anthropic rules
│   │   │   ├── chatgpt.ts            ← ChatGPT / OpenAI rules
│   │   │   ├── anthropic-api.ts      ← Anthropic API (direct usage) rules
│   │   │   ├── openai-api.ts         ← OpenAI API (direct usage) rules
│   │   │   ├── gemini.ts             ← Gemini rules
│   │   │   └── windsurf.ts           ← Windsurf (or v0) rules
│   │   ├── types.ts                  ← All shared audit TypeScript types
│   │   └── pricing.ts                ← Pricing constants (sourced from PRICING_DATA.md)
│   │
│   ├── db/
│   │   ├── client.ts                 ← Drizzle ORM + Supabase client initialization
│   │   ├── schema.ts                 ← Drizzle table definitions
│   │   └── migrations/               ← Drizzle-kit generated migration files
│   │
│   ├── ai/
│   │   └── summary.ts                ← Anthropic API call + fallback logic
│   │
│   ├── email/
│   │   ├── client.ts                 ← Resend client initialization
│   │   └── templates/
│   │       └── AuditConfirmation.tsx ← React Email template
│   │
│   ├── rate-limit/
│   │   └── index.ts                  ← Upstash rate limiter setup
│   │
│   ├── validators/
│   │   ├── audit-input.ts            ← Zod schema for POST /api/audit/submit
│   │   └── lead-input.ts             ← Zod schema for POST /api/leads/capture
│   │
│   └── logger.ts                     ← Pino logger instance (singleton)
│
└── types/
    └── api.ts                        ← Shared request/response types for frontend ↔ backend
```

### Naming Conventions

| Pattern | Rule |
|---|---|
| API route files | `route.ts` only — Next.js App Router convention |
| Audit rule files | Named after the tool, kebab-case: `github-copilot.ts` |
| Functions | `camelCase` |
| Types/interfaces | `PascalCase` with descriptive names: `AuditResult`, `LeadInput` |
| Constants | `UPPER_SNAKE_CASE`: `GITHUB_COPILOT_INDIVIDUAL_PRICE` |
| Database columns | `snake_case` (Postgres convention, mapped to camelCase by Drizzle) |

---

## 4. Database Design

### ORM: Drizzle ORM

Use Drizzle ORM with the `pg` driver pointed at Supabase's connection string. Drizzle provides TypeScript-inferred return types for every query — no manual type casting.

**Initialize in `src/lib/db/client.ts`:**

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

// For serverless: disable connection pooling (Supabase has its own pooler)
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
```

### Schema Definition (`src/lib/db/schema.ts`)

```typescript
import { pgTable, uuid, text, numeric, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const audits = pgTable('audits', {
  id:                   uuid('id').primaryKey().defaultRandom(),
  auditData:            jsonb('audit_data').notNull(),       // Full AuditInput + AuditResult[]
  useCase:              text('use_case').notNull(),           // 'coding' | 'writing' | ...
  totalSavingsMonthly:  numeric('total_savings_monthly').notNull(),
  createdAt:            timestamp('created_at').defaultNow().notNull(),
  publicSlug:           text('public_slug').unique().notNull(), // 8–12 char alphanumeric
});

export const leads = pgTable('leads', {
  id:               uuid('id').primaryKey().defaultRandom(),
  email:            text('email').notNull(),
  companyName:      text('company_name'),
  role:             text('role'),
  teamSize:         integer('team_size'),
  auditId:          uuid('audit_id').references(() => audits.id).notNull(),
  createdAt:        timestamp('created_at').defaultNow().notNull(),
  savingsPerMonth:  numeric('savings_per_month').notNull(),
  highValue:        boolean('high_value').notNull().default(false), // true if savings > $500/mo
  notifyOnly:       boolean('notify_only').notNull().default(false), // true for "notify me" flow
});

export const promptLogs = pgTable('prompt_logs', {
  id:          uuid('id').primaryKey().defaultRandom(),
  auditId:     uuid('audit_id').references(() => audits.id).notNull(),
  prompt:      text('prompt').notNull(),          // Full prompt sent to Anthropic
  response:    text('response'),                  // Sanitized response (no PII)
  modelUsed:   text('model_used').notNull(),
  durationMs:  integer('duration_ms'),
  wasError:    boolean('was_error').notNull().default(false),
  errorReason: text('error_reason'),
  createdAt:   timestamp('created_at').defaultNow().notNull(),
});
```

### Drizzle Migrations

Run migrations with `drizzle-kit`:

```bash
# Generate migration file from schema changes
npx drizzle-kit generate:pg

# Push to Supabase (development only — use migrations in production)
npx drizzle-kit push:pg
```

**Migration files** are committed in `src/lib/db/migrations/`. Never edit generated migration files by hand.

### Database Rules

- Every `INSERT` must use Drizzle's typed insert — never raw SQL strings.
- The `audits.auditData` JSONB column stores the complete audit payload. This allows replaying the audit without rerunning the engine.
- `leads.auditId` is a required foreign key — leads cannot exist without a parent audit.
- `leads.highValue` is computed at insertion time: `totalSavingsMonthly > 500`.
- Indexes to create in Supabase console:
  - `audits.public_slug` — unique index (already defined in schema via `.unique()`)
  - `leads.audit_id` — index for fast join queries
  - `leads.email` — index for idempotency lookup

### Slug Generation

```typescript
// src/lib/audit/engine.ts
import { customAlphabet } from 'nanoid';

// Alphanumeric only, no lookalike chars (0/O, 1/I/l)
const nanoid = customAlphabet('23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz', 10);

export function generatePublicSlug(): string {
  return nanoid(); // e.g. "k7RmQvP3wX"
}
```

Add `nanoid` to dependencies: `npm install nanoid`.

---

## 5. API Routes Specification

### 5.1 POST `/api/audit/submit`

**Purpose:** Accept user's tool spend input, run the audit engine, persist result, return audit ID and results.

**Runtime:** Node.js (default serverless function)

**Request body shape** (validated by Zod — see §11):

```typescript
{
  tools: Array<{
    toolId: string;         // e.g. "github_copilot"
    plan: string;           // e.g. "business"
    seats: number;          // min 1
    monthlySpend: number;   // USD, >= 0
  }>;
  teamSize: number;         // min 1
  useCase: 'coding' | 'writing' | 'data_analysis' | 'research' | 'mixed';
}
```

**Response shape (200):**

```typescript
{
  auditId: string;          // UUID
  publicSlug: string;       // 10-char slug for share URL
  results: AuditResult[];   // Per-tool breakdown
  totalSavingsMonthly: number;
  totalSavingsAnnual: number;
}
```

**Error responses:**

| Status | Condition | Body |
|---|---|---|
| 400 | Zod validation failure | `{ error: "Validation failed", details: ZodError.issues }` |
| 429 | Rate limit exceeded | `{ error: "Too many requests. Try again in an hour." }` |
| 500 | DB insert failure | `{ error: "Failed to save audit. Please try again." }` |

**Implementation skeleton:**

```typescript
// src/app/api/audit/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auditInputSchema } from '@/lib/validators/audit-input';
import { runAudit } from '@/lib/audit/engine';
import { db } from '@/lib/db/client';
import { audits } from '@/lib/db/schema';
import { generatePublicSlug } from '@/lib/audit/engine';
import { checkRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  // 1. Rate limit check
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const { success } = await checkRateLimit(ip);
  if (!success) {
    return NextResponse.json({ error: 'Too many requests. Try again in an hour.' }, { status: 429 });
  }

  // 2. Parse and validate body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = auditInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.issues }, { status: 400 });
  }

  const input = parsed.data;

  // 3. Run audit engine (pure, synchronous)
  const results = runAudit(input);
  const totalSavingsMonthly = results.reduce((sum, r) => sum + r.savingsPerMonth, 0);
  const totalSavingsAnnual = totalSavingsMonthly * 12;

  // 4. Save to DB
  const publicSlug = generatePublicSlug();
  try {
    const [inserted] = await db.insert(audits).values({
      auditData: { input, results },
      useCase: input.useCase,
      totalSavingsMonthly: String(totalSavingsMonthly),
      publicSlug,
    }).returning();

    logger.info({ auditId: inserted.id, totalSavingsMonthly }, 'Audit saved');

    return NextResponse.json({
      auditId: inserted.id,
      publicSlug: inserted.publicSlug,
      results,
      totalSavingsMonthly,
      totalSavingsAnnual,
    });
  } catch (err) {
    logger.error({ err }, 'DB insert failed for audit');
    return NextResponse.json({ error: 'Failed to save audit. Please try again.' }, { status: 500 });
  }
}
```

---

### 5.2 GET `/api/audit/summary?auditId=<uuid>`

**Purpose:** Generate the AI narrative summary for an audit. Called separately from the results page after the audit card loads — decoupled so a slow API call doesn't block the rest of the UI.

**Runtime:** Node.js serverless function

**Query parameter:** `auditId` (UUID string, required)

**Response shape (200):**

```typescript
{
  summary: string;      // ~100-word plain English paragraph
  wasFallback: boolean; // true if Anthropic API failed and template was used
}
```

**Error responses:**

| Status | Condition |
|---|---|
| 400 | Missing or malformed `auditId` |
| 404 | Audit not found in DB |
| 500 | Unexpected error (DB fetch failure) |

**Note:** Anthropic API failures do NOT return 500 — they return 200 with `wasFallback: true`. The failure is logged internally.

---

### 5.3 POST `/api/leads/capture`

**Purpose:** Save user's email and optional metadata after they've seen their audit results.

**Runtime:** Node.js serverless function

**Request body:**

```typescript
{
  auditId: string;          // UUID — required
  email: string;            // required, valid email format
  companyName?: string;     // optional
  role?: string;            // optional
  teamSize?: number;        // optional, min 1
  notifyOnly?: boolean;     // true for "notify me of optimizations" flow
}
```

**Response shape (200):**

```typescript
{ success: true }
```

**Idempotency:** If `(auditId, email)` pair already exists in the `leads` table, return `200` with `{ success: true }` — do not insert a duplicate, do not re-send the email.

**Error responses:**

| Status | Condition |
|---|---|
| 400 | Zod validation failure (missing email, bad email format) |
| 404 | `auditId` does not exist in `audits` table |
| 500 | DB insert or email send failure |

---

### 5.4 GET `/api/og?auditId=<uuid>`

**Purpose:** Generate a dynamic Open Graph image for the shareable audit URL.

**Runtime:** Edge Runtime (required by `@vercel/og`)

**Declaration at top of file:**

```typescript
export const runtime = 'edge';
```

**Output:** PNG image, `Content-Type: image/png`

**Image content:**
- Product name/logo (top left)
- "I found $X,XXX in annual AI savings" (hero text, large)
- Top 2–3 tool savings listed below
- Credex branding (bottom)
- Dark background matching app design tokens

**Caching:** Add `Cache-Control: public, max-age=86400` header — OG images are immutable per `auditId`.

---

## 6. Audit Engine

### Location: `src/lib/audit/`

The audit engine is the core of the product. It is a set of pure TypeScript functions that take a validated user input and return a structured audit result. It has zero side effects — no DB calls, no API calls, no logging. This makes it fully unit-testable in isolation.

### Shared Types (`src/lib/audit/types.ts`)

```typescript
export type ToolId =
  | 'cursor'
  | 'github_copilot'
  | 'claude'
  | 'chatgpt'
  | 'anthropic_api'
  | 'openai_api'
  | 'gemini'
  | 'windsurf'; // or 'v0' — document choice in DEVLOG.md

export type UseCase = 'coding' | 'writing' | 'data_analysis' | 'research' | 'mixed';

export type AuditStatus = 'optimal' | 'overspending' | 'switch_recommended';

export interface ToolInput {
  toolId: ToolId;
  plan: string;
  seats: number;
  monthlySpend: number;
}

export interface AuditInput {
  tools: ToolInput[];
  teamSize: number;
  useCase: UseCase;
}

export interface AuditResult {
  toolId: ToolId;
  toolName: string;              // Human-readable: "GitHub Copilot"
  status: AuditStatus;
  currentMonthlySpend: number;
  recommendedAction: string;     // 1–2 sentences, actionable
  savingsPerMonth: number;       // 0 if status is 'optimal'
  reason: string;                // 1 sentence, citable to a pricing page
  credexApplicable: boolean;     // true if Credex credits can save money here
}
```

### Pricing Constants (`src/lib/audit/pricing.ts`)

All dollar amounts live here, sourced from `PRICING_DATA.md`. No hardcoded numbers anywhere else.

```typescript
// Example — expand for all tools
export const PRICING = {
  GITHUB_COPILOT: {
    INDIVIDUAL: 10,          // $10/month flat
    BUSINESS_PER_SEAT: 19,   // $19/user/month
    ENTERPRISE_PER_SEAT: 39, // $39/user/month
  },
  CURSOR: {
    HOBBY: 0,
    PRO_PER_SEAT: 20,
    BUSINESS_PER_SEAT: 40,
  },
  CLAUDE: {
    FREE: 0,
    PRO_PER_SEAT: 20,
    MAX_PER_SEAT: 100,
    TEAM_PER_SEAT: 30,
  },
  CHATGPT: {
    PLUS_PER_SEAT: 20,
    TEAM_PER_SEAT: 30,
    ENTERPRISE: null,  // Custom pricing — cannot evaluate
  },
  GEMINI: {
    PRO_PER_SEAT: 20,
    ULTRA: null,       // Custom pricing
  },
  // ... continue for all tools
} as const;
```

### Master Engine (`src/lib/audit/engine.ts`)

```typescript
import { AuditInput, AuditResult } from './types';
import { auditCursor } from './rules/cursor';
import { auditGithubCopilot } from './rules/github-copilot';
import { auditClaude } from './rules/claude';
// ... import all tool auditors

export function runAudit(input: AuditInput): AuditResult[] {
  return input.tools.map((tool) => {
    switch (tool.toolId) {
      case 'cursor':          return auditCursor(tool, input);
      case 'github_copilot':  return auditGithubCopilot(tool, input);
      case 'claude':          return auditClaude(tool, input);
      // ... all cases
      default:
        // This should be caught by Zod validation before reaching here
        throw new Error(`Unknown toolId: ${tool.toolId}`);
    }
  });
}
```

### Individual Rule File Structure

Each tool's rule file exports a single function. Here is the full, annotated example for GitHub Copilot — replicate this pattern for all tools:

```typescript
// src/lib/audit/rules/github-copilot.ts

import { ToolInput, AuditInput, AuditResult, AuditStatus } from '../types';
import { PRICING } from '../pricing';

export function auditGithubCopilot(tool: ToolInput, context: AuditInput): AuditResult {
  const { plan, seats, monthlySpend } = tool;
  const { useCase } = context;

  // Rule 1: Business plan with ≤3 seats — Individual is cheaper
  if (plan === 'business' && seats <= 3 && (useCase === 'coding' || useCase === 'mixed')) {
    const optimalSpend = PRICING.GITHUB_COPILOT.INDIVIDUAL; // $10 flat
    const savings = monthlySpend - optimalSpend;
    return {
      toolId: 'github_copilot',
      toolName: 'GitHub Copilot',
      status: 'overspending',
      currentMonthlySpend: monthlySpend,
      recommendedAction:
        `Downgrade to GitHub Copilot Individual ($10/month flat). ` +
        `Business adds SSO and audit logs — unnecessary for teams under 5.`,
      savingsPerMonth: Math.max(0, savings),
      reason: `GitHub Copilot Individual costs $10/month vs Business at $${PRICING.GITHUB_COPILOT.BUSINESS_PER_SEAT}/seat — identical coding features for teams under 5.`,
      credexApplicable: false,
    };
  }

  // Rule 2: Enterprise plan with ≤10 seats — Business is sufficient
  if (plan === 'enterprise' && seats <= 10) {
    const optimalSpend = seats * PRICING.GITHUB_COPILOT.BUSINESS_PER_SEAT;
    const savings = monthlySpend - optimalSpend;
    return {
      toolId: 'github_copilot',
      toolName: 'GitHub Copilot',
      status: 'overspending',
      currentMonthlySpend: monthlySpend,
      recommendedAction:
        `Downgrade to GitHub Copilot Business ($${PRICING.GITHUB_COPILOT.BUSINESS_PER_SEAT}/seat). ` +
        `Enterprise features (dedicated support, advanced security scanning) only pay off at 50+ seats.`,
      savingsPerMonth: Math.max(0, savings),
      reason: `GitHub Copilot Business at $${PRICING.GITHUB_COPILOT.BUSINESS_PER_SEAT}/seat covers all coding assistance features; Enterprise adds compliance tooling irrelevant at under 10 seats.`,
      credexApplicable: false,
    };
  }

  // Rule 3: Pure writing or research use case — suggest cheaper alternative
  if (plan !== 'individual' && (useCase === 'writing' || useCase === 'research')) {
    return {
      toolId: 'github_copilot',
      toolName: 'GitHub Copilot',
      status: 'switch_recommended',
      currentMonthlySpend: monthlySpend,
      recommendedAction:
        `For writing/research workflows, Claude Pro ($20/seat) offers better document understanding. ` +
        `GitHub Copilot is optimized for inline code completion — wrong tool for this use case.`,
      savingsPerMonth: Math.max(0, monthlySpend - (tool.seats * 20)),
      reason: `GitHub Copilot is a code autocomplete tool; it provides no value for writing or research use cases. Claude Pro handles both at $20/seat.`,
      credexApplicable: true,
    };
  }

  // Optimal — no changes needed
  return {
    toolId: 'github_copilot',
    toolName: 'GitHub Copilot',
    status: 'optimal',
    currentMonthlySpend: monthlySpend,
    recommendedAction: `You are on the right GitHub Copilot plan for your team size and use case.`,
    savingsPerMonth: 0,
    reason: `Current plan is appropriate for ${seats} seat(s) on a ${useCase} use case.`,
    credexApplicable: false,
  };
}
```

### Audit Engine Invariants (must hold for all rules)

These are enforced in tests (`TESTS.md`):

1. `savingsPerMonth` is always `>= 0`. Never negative. Use `Math.max(0, calculated)`.
2. If `status === 'optimal'`, then `savingsPerMonth === 0`.
3. If `status !== 'optimal'`, `savingsPerMonth` must be `> 0` OR `recommendedAction` must explicitly explain why the switch is advisable even without immediate savings.
4. `totalSavingsMonthly === sum(results.map(r => r.savingsPerMonth))` — the frontend hero number is derived from this sum, so it must be exact.
5. Every rule must be traceable to a URL in `PRICING_DATA.md`. Add a comment above each threshold: `// Source: https://cursor.sh/pricing — verified 2026-05-07`.

### API Spend Handling (Anthropic API, OpenAI API)

API tools don't have fixed plans — spend is usage-based. Apply these rules:

```typescript
// Flag extremely high spend for review rather than recommending a specific plan
if (tool.toolId === 'anthropic_api' && tool.monthlySpend > 5000) {
  return {
    status: 'overspending',
    recommendedAction: `Your Anthropic API spend is unusually high for a team of ${context.teamSize}. Set usage limits in your Anthropic console and review which calls are driving costs.`,
    savingsPerMonth: 0,  // Cannot quantify without usage breakdown
    reason: `API spend above $5,000/month for a team of ${context.teamSize} warrants a usage audit before recommending a specific action.`,
    credexApplicable: true, // Credex credits are relevant here
  };
}
```

---

## 7. AI Summary Generation

### Location: `src/lib/ai/summary.ts`

This module handles the call to Anthropic's API and the fallback path. It is called only from `GET /api/audit/summary`.

### Model

**Always use:** `claude-sonnet-4-20250514`

Do not use Haiku (quality too low for user-facing content). Do not use Opus (cost unjustified for a 100-word paragraph).

### Prompt Structure

The full prompt is saved verbatim in `PROMPTS.md`. Here is the shape:

```typescript
const systemPrompt = `You are a financial analyst specializing in SaaS optimization for early-stage startups. 
Your job is to write a single plain-English paragraph (approximately 100 words) summarizing an AI tool spending audit for a startup. 
Be specific, use the actual tool names and dollar amounts provided. 
Speak directly to the user ("your team", "you're spending"). 
Do not use bullet points, headers, or markdown — pure prose only. 
Do not mention Credex or any vendor by name except those in the audit data.
Be honest: if they're spending well, say so.`;

const userPrompt = `Here is the audit data:
- Team size: ${input.teamSize} people
- Primary use case: ${input.useCase}
- Tools audited: ${results.map(r => `${r.toolName} (${r.status}, $${r.savingsPerMonth}/mo potential saving)`).join(', ')}
- Total potential monthly savings: $${totalSavingsMonthly}
- Total potential annual savings: $${totalSavingsAnnual}

Per-tool findings:
${results.map(r => `${r.toolName}: ${r.recommendedAction}`).join('\n')}

Write the 100-word summary paragraph now.`;
```

### Implementation

```typescript
// src/lib/ai/summary.ts
import Anthropic from '@anthropic-ai/sdk';
import { db } from '@/lib/db/client';
import { promptLogs } from '@/lib/db/schema';
import { logger } from '@/lib/logger';
import type { AuditResult } from '@/lib/audit/types';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const TIMEOUT_MS = 10_000; // 10-second client-side timeout

export async function generateSummary(
  auditId: string,
  results: AuditResult[],
  totalSavingsMonthly: number,
  teamSize: number,
  useCase: string,
): Promise<{ summary: string; wasFallback: boolean }> {
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt({ results, totalSavingsMonthly, teamSize, useCase });
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }, { signal: controller.signal });

    clearTimeout(timeout);
    const summary = message.content[0].type === 'text' ? message.content[0].text : '';

    // Log prompt + response (no PII in the prompt — input was already sanitized)
    await logPrompt({ auditId, prompt: userPrompt, response: summary, durationMs: Date.now() - startTime });

    return { summary, wasFallback: false };

  } catch (err) {
    const errorReason = err instanceof Error ? err.message : 'Unknown error';
    logger.warn({ auditId, errorReason }, 'Anthropic API failed — using fallback summary');

    await logPrompt({ auditId, prompt: userPrompt, response: null, durationMs: Date.now() - startTime, wasError: true, errorReason });

    return { summary: buildFallbackSummary({ results, totalSavingsMonthly, teamSize, useCase }), wasFallback: true };
  }
}
```

### Fallback Template

The fallback must be a quality, human-feeling paragraph — not obviously templated. Write it carefully. Example:

```typescript
function buildFallbackSummary({ results, totalSavingsMonthly, teamSize, useCase }: SummaryContext): string {
  const overspendingTools = results.filter(r => r.status !== 'optimal');
  const toolList = overspendingTools.map(r => r.toolName).join(' and ');

  if (totalSavingsMonthly === 0) {
    return `Based on current pricing, your team of ${teamSize} is running a well-optimized AI tool stack for ${useCase} work. Every subscription you're paying for is appropriately sized for your team — no immediate changes are needed. Keep an eye on seat counts as you grow, and revisit this audit when you onboard your next batch of engineers.`;
  }

  return `Your team of ${teamSize} has room to recover approximately $${totalSavingsMonthly.toLocaleString()} per month — $${(totalSavingsMonthly * 12).toLocaleString()} annually — by adjusting a few subscriptions. The clearest wins are with ${toolList || 'your current tools'}, where your current plans don't match your actual ${useCase} use case or team size. The savings identified here are conservative estimates based on publicly verified pricing — no theoretical numbers.`;
}
```

### API Failure Handling Rules

- A `429` from Anthropic → fallback, no retry (rate limit signals overuse)
- A `5xx` from Anthropic → fallback, log error
- Network timeout (> 10s) → fallback, log timeout
- Missing `ANTHROPIC_API_KEY` env var → fallback, log warning to console (don't crash)
- All failures are transparent to the user — they receive a summary, period

---

## 8. Email System

### Location: `src/lib/email/`

### Client Initialization (`src/lib/email/client.ts`)

```typescript
import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);
```

### Sending Email (called from `POST /api/leads/capture`)

```typescript
import { resend } from '@/lib/email/client';
import { AuditConfirmationEmail } from './templates/AuditConfirmation';

await resend.emails.send({
  from: process.env.RESEND_FROM_EMAIL!, // e.g. audit@yourdomain.com
  to: leadEmail,
  subject: `Your AI Spend Audit — $${Math.round(totalSavingsMonthly).toLocaleString()}/mo in potential savings`,
  react: AuditConfirmationEmail({
    totalSavingsMonthly,
    totalSavingsAnnual: totalSavingsMonthly * 12,
    topRecommendations: results.filter(r => r.status !== 'optimal').slice(0, 2),
    shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/share/${publicSlug}`,
    highValue: totalSavingsMonthly > 500,
  }),
});
```

### Email Template Requirements (`src/lib/email/templates/AuditConfirmation.tsx`)

Built with `@react-email/components`. Must include:

- Subject line referencing savings amount (personalized)
- Hero savings figure (monthly + annual)
- Top 2 recommendations from the audit (tool name, recommended action, savings)
- Link to the shareable audit URL
- If `highValue === true`: "A Credex advisor will reach out to explore discounted AI credits for your stack."
- If `highValue === false`: "We'll notify you when new cost optimizations apply to your stack."
- Footer: unsubscribe link placeholder, Credex branding

**Do not include:**
- HTML so complex it breaks in Gmail (test with Email on Acid or Litmus equivalent)
- Any PII beyond the user's email address
- The user's company name in the subject line (treat it as optional metadata)

### Email Failure Handling

If Resend returns an error:
- Log the error with `logger.error`
- The lead is STILL saved to the database (the DB insert already succeeded)
- Return `{ success: true }` to the client — don't punish the user for a transient email failure
- Do not re-throw the error

---

## 9. Rate Limiting & Abuse Protection

### Provider: Upstash Redis via `@upstash/ratelimit`

### Setup (`src/lib/rate-limit/index.ts`)

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// 5 audit submissions per IP per hour
export const auditRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 h'),
  analytics: true,
});

export async function checkRateLimit(ip: string): Promise<{ success: boolean }> {
  return auditRateLimit.limit(ip);
}
```

### Applied To

Rate limiting is applied only to `POST /api/audit/submit`. Other routes are not rate-limited in the MVP.

### Honeypot Field

In addition to rate limiting, add a hidden honeypot field to the frontend audit form:

```html
<!-- Hidden from real users via CSS — bots will fill it in -->
<input name="website" type="text" style="display:none" tabIndex={-1} autoComplete="off" />
```

In `POST /api/audit/submit`, if `body.website` is present and non-empty, silently return `200` with a fake success response without running the engine or touching the DB:

```typescript
// Honeypot check — must come BEFORE Zod validation
if (typeof body === 'object' && body !== null && 'website' in body && (body as any).website) {
  // Bot detected — fake success, log internally
  logger.info({ ip }, 'Honeypot triggered — discarding submission');
  return NextResponse.json({ auditId: 'fake', results: [], totalSavingsMonthly: 0, totalSavingsAnnual: 0 });
}
```

### Rate Limit Response

When rate limited, return HTTP `429` with:

```json
{ "error": "Too many submissions. Try again in an hour." }
```

The frontend displays this in a toast notification (red, auto-dismiss 4s).

---

## 10. Shareable URL & OG Image Generation

### URL Structure

- **Private results:** `/results/[auditId]` — UUID, never shown publicly
- **Public share:** `/share/[publicSlug]` — 10-char alphanumeric slug, shown publicly

The `publicSlug` is generated at audit creation (`POST /api/audit/submit`) and stored alongside the `auditId` in the `audits` table.

### Public Share Page Data

When the `/share/[publicSlug]` page loads (as a Server Component), it fetches the audit by slug from Supabase and strips all PII before rendering. The server renders the page with:

```typescript
// app/share/[slug]/page.tsx
const audit = await db.query.audits.findFirst({ where: eq(audits.publicSlug, params.slug) });
if (!audit) return notFound();

// Strip PII — only expose what's safe to be public
const publicData = {
  results: audit.auditData.results.map(r => ({
    toolName: r.toolName,
    status: r.status,
    savingsPerMonth: r.savingsPerMonth,
    recommendedAction: r.recommendedAction,
    reason: r.reason,
  })),
  totalSavingsMonthly: audit.totalSavingsMonthly,
  useCase: audit.useCase,
  // NOTE: Do NOT expose teamSize, companyName, email, or any form of PII
};
```

### OG Image Route (`src/app/api/og/route.tsx`)

```typescript
export const runtime = 'edge';

import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const auditId = searchParams.get('auditId');
  
  // Fetch audit data from Supabase (lightweight fetch in edge)
  // ... fetch and render OG image JSX
  
  return new ImageResponse(
    (
      <div style={{ /* dark background, savings number, tool list */ }}>
        {/* OG image content */}
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: { 'Cache-Control': 'public, max-age=86400, immutable' },
    }
  );
}
```

### Open Graph Meta Tags (set in `app/share/[slug]/page.tsx`)

```typescript
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const audit = await fetchAuditBySlug(params.slug);
  const savings = Math.round(Number(audit?.totalSavingsMonthly ?? 0));

  return {
    title: `AI Spend Audit — $${savings.toLocaleString()}/mo in savings identified`,
    description: 'Free AI tool spend audit — see where your team is overpaying.',
    openGraph: {
      title: `I found $${(savings * 12).toLocaleString()}/yr in AI tool savings`,
      description: 'Free AI spend audit — see what your team could save',
      images: [`${process.env.NEXT_PUBLIC_APP_URL}/api/og?auditId=${audit?.id}`],
    },
    twitter: {
      card: 'summary_large_image',
    },
  };
}
```

---

## 11. Input Validation

### Library: Zod

All API route inputs are validated with Zod schemas before any business logic runs.

### Audit Input Schema (`src/lib/validators/audit-input.ts`)

```typescript
import { z } from 'zod';

const toolIdSchema = z.enum([
  'cursor', 'github_copilot', 'claude', 'chatgpt',
  'anthropic_api', 'openai_api', 'gemini', 'windsurf',
]);

const toolInputSchema = z.object({
  toolId: toolIdSchema,
  plan: z.string().min(1).max(50),
  seats: z.number().int().min(1).max(10_000),
  monthlySpend: z.number().min(0).max(1_000_000),
});

export const auditInputSchema = z.object({
  tools: z
    .array(toolInputSchema)
    .min(1, 'At least one tool is required')
    .max(20, 'Maximum 20 tools supported')
    .refine(
      (tools) => new Set(tools.map(t => t.toolId)).size === tools.length,
      { message: 'Duplicate tools are not allowed' }
    ),
  teamSize: z.number().int().min(1).max(10_000),
  useCase: z.enum(['coding', 'writing', 'data_analysis', 'research', 'mixed']),
  website: z.string().optional(), // Honeypot field — expected to be empty
});
```

### Lead Input Schema (`src/lib/validators/lead-input.ts`)

```typescript
import { z } from 'zod';

export const leadInputSchema = z.object({
  auditId: z.string().uuid(),
  email: z.string().email('Please enter a valid email address'),
  companyName: z.string().max(200).optional(),
  role: z.string().max(100).optional(),
  teamSize: z.number().int().min(1).max(100_000).optional(),
  notifyOnly: z.boolean().optional().default(false),
});
```

### Validation Rules

- Run `schema.safeParse()` — never `schema.parse()` in API routes (the latter throws, the former returns an error object you can inspect)
- Return `400` with `details: parsed.error.issues` for validation failures
- Validate at the API route level — do not add validation inside the audit engine (that's not its job)
- The audit engine can `assert` its invariants internally (e.g., `seats >= 1`) as a safety net, but primary validation is Zod

---

## 12. Error Handling Strategy

### Principle: Never let an unhandled exception reach the user

Every async operation in every API route is wrapped in try/catch. The catch block always:
1. Logs the error with `logger.error`
2. Returns a meaningful HTTP response (never a raw error object or stack trace)

### Error Response Format

All error responses follow this shape:

```typescript
{ error: string }        // User-facing message (no technical details)
// or
{ error: string; details: unknown }  // For validation errors only
```

### Error Classification

| Error Type | HTTP Status | User Message | Action |
|---|---|---|---|
| Zod validation failure | 400 | "Validation failed" + field details | Return details |
| Duplicate tool in input | 400 | "Duplicate tools are not allowed" | Return field details |
| Audit not found (invalid UUID) | 404 | "Audit not found. It may have expired." | No logging |
| Rate limit exceeded | 429 | "Too many submissions. Try again in an hour." | Log IP |
| DB connection failure | 500 | "Failed to save audit. Please try again." | Log error |
| Anthropic API failure | 200 (with `wasFallback: true`) | — | Log warning |
| Resend email failure | 200 (lead already saved) | — | Log error |
| Unknown/unexpected | 500 | "Something went wrong. Please try again." | Log error + stack |

### Global Error Boundary

Next.js App Router convention: create `src/app/error.tsx` (client component) and `src/app/global-error.tsx` for root layout errors. These catch rendering errors — not API route errors.

---

## 13. Logging

### Library: Pino

Pino is a high-performance JSON logger. It is the only logger used in this project — no `console.log` in production code.

### Singleton Instance (`src/lib/logger.ts`)

```typescript
import pino from 'pino';

export const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: process.env.NODE_ENV !== 'production'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined, // Production: raw JSON to Vercel's log ingestion
});
```

### What to Log

| Event | Level | Fields |
|---|---|---|
| Audit saved successfully | `info` | `auditId`, `totalSavingsMonthly`, `useCase` |
| Anthropic API called | `debug` | `auditId`, `model` |
| Anthropic API failed | `warn` | `auditId`, `errorReason`, `durationMs` |
| Lead captured | `info` | `auditId`, `highValue`, `notifyOnly` |
| Email send failed | `error` | `auditId`, `errorReason` |
| Rate limit triggered | `info` | `ip` |
| Honeypot triggered | `info` | `ip` |
| DB query failed | `error` | `operation`, `errorReason` |
| Unexpected 500 | `error` | `route`, `errorReason`, `stack` |

### What NOT to Log

- Email addresses (PII)
- Company names (PII)
- Full request bodies (may contain PII)
- Anthropic prompt content with tool names only is acceptable — do not log team size, company, or user context fields

---

## 14. Environment Variables & Secrets

### Required Variables

All variables live in `.env.local` (development) and Vercel dashboard (production/preview). Never committed to the repository.

```bash
# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
DATABASE_URL=postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...

# Resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=audit@yourdomain.com

# App
NEXT_PUBLIC_APP_URL=https://yourapp.vercel.app
```

### `.env.example` (committed to repository)

```bash
# Anthropic
ANTHROPIC_API_KEY=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DATABASE_URL=

# Upstash Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# App
NEXT_PUBLIC_APP_URL=
```

### Rules

- Any variable prefixed `NEXT_PUBLIC_` is exposed to the browser. Never put secrets there.
- `DATABASE_URL` is server-only. Use Supabase's `ANON_KEY` for client-side queries if needed (but in this app, all DB access is server-side).
- If a required variable is missing at startup, the app should fail loudly in development. In production, missing vars will cause runtime errors on the first call — ensure Vercel has all vars set before deploy.
- Add a startup check in `src/lib/db/client.ts`:

```typescript
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Check your .env.local or Vercel environment variables.');
}
```

---

## 15. Testing Requirements

### Framework: Vitest

Run with `npm test`. Must pass in CI (`npm test` in `.github/workflows/ci.yml`).

### Minimum 5 Tests — All Covering the Audit Engine

Tests live in `src/lib/audit/__tests__/`. Each test file covers one tool or one invariant category.

**Required test cases (from PRD §10):**

```typescript
// src/lib/audit/__tests__/github-copilot.test.ts

import { describe, it, expect } from 'vitest';
import { auditGithubCopilot } from '../rules/github-copilot';

describe('GitHub Copilot audit rules', () => {
  it('recommends Individual plan for Business plan with 2 seats', () => {
    const result = auditGithubCopilot(
      { toolId: 'github_copilot', plan: 'business', seats: 2, monthlySpend: 38 },
      { tools: [], teamSize: 2, useCase: 'coding' }
    );
    expect(result.status).toBe('overspending');
    expect(result.savingsPerMonth).toBe(28); // 38 - 10 = 28
    expect(result.savingsPerMonth).toBeGreaterThan(0);
  });

  it('returns optimal for Individual plan at any seat count', () => {
    const result = auditGithubCopilot(
      { toolId: 'github_copilot', plan: 'individual', seats: 1, monthlySpend: 10 },
      { tools: [], teamSize: 1, useCase: 'coding' }
    );
    expect(result.status).toBe('optimal');
    expect(result.savingsPerMonth).toBe(0);
  });
});

// src/lib/audit/__tests__/invariants.test.ts

import { describe, it, expect } from 'vitest';
import { runAudit } from '../engine';

describe('Audit engine invariants', () => {
  it('total savings equals sum of per-tool savings', () => {
    const input = {
      tools: [
        { toolId: 'github_copilot', plan: 'business', seats: 2, monthlySpend: 38 },
        { toolId: 'cursor', plan: 'business', seats: 2, monthlySpend: 80 },
      ],
      teamSize: 2,
      useCase: 'coding',
    };
    const results = runAudit(input as any);
    const engineTotal = results.reduce((sum, r) => sum + r.savingsPerMonth, 0);
    expect(engineTotal).toBe(results.reduce((s, r) => s + r.savingsPerMonth, 0));
  });

  it('generates no false savings when all tools are optimal', () => {
    const input = {
      tools: [
        { toolId: 'github_copilot', plan: 'individual', seats: 1, monthlySpend: 10 },
      ],
      teamSize: 1,
      useCase: 'coding',
    };
    const results = runAudit(input as any);
    expect(results.every(r => r.savingsPerMonth >= 0)).toBe(true);
    const totalSavings = results.reduce((sum, r) => sum + r.savingsPerMonth, 0);
    expect(totalSavings).toBe(0);
  });

  it('handles 1 seat on a per-seat plan without crashing', () => {
    const input = {
      tools: [{ toolId: 'cursor', plan: 'pro', seats: 1, monthlySpend: 20 }],
      teamSize: 1,
      useCase: 'coding',
    };
    expect(() => runAudit(input as any)).not.toThrow();
  });

  it('savingsPerMonth is never negative', () => {
    const input = {
      tools: [{ toolId: 'claude', plan: 'team', seats: 1, monthlySpend: 5 }], // underreported spend
      teamSize: 1,
      useCase: 'writing',
    };
    const results = runAudit(input as any);
    results.forEach(r => expect(r.savingsPerMonth).toBeGreaterThanOrEqual(0));
  });

  it('use-case-specific alternative is surfaced for pure coding use case', () => {
    const input = {
      tools: [{ toolId: 'chatgpt', plan: 'team', seats: 5, monthlySpend: 150 }],
      teamSize: 5,
      useCase: 'coding',
    };
    const results = runAudit(input as any);
    const chatgptResult = results.find(r => r.toolId === 'chatgpt');
    // For pure coding, a Cursor or Copilot recommendation should be surfaced
    expect(chatgptResult?.recommendedAction).toMatch(/cursor|copilot|coding/i);
  });
});
```

### Test Configuration (`vitest.config.ts`)

```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
```

---

## 16. Performance & Scalability Notes

### Current MVP Targets

- `POST /api/audit/submit` response time: < 200ms (no external calls — pure computation + single DB insert)
- `GET /api/audit/summary` response time: < 12s (Anthropic API can be slow; client shows skeleton)
- `POST /api/leads/capture` response time: < 1s (one DB insert + one Resend call)

### Serverless Function Sizing

Vercel serverless functions have a 10-second default timeout. `GET /api/audit/summary` is the only route that may approach this — the 10-second client-side AbortController timeout ensures the function doesn't hang.

If needed, increase the function timeout for the summary route only:

```typescript
// src/app/api/audit/summary/route.ts
export const maxDuration = 20; // Vercel: extend to 20s for this route
```

### Supabase Connection Pooling

Use `{ prepare: false }` in the Drizzle/postgres client (see §4). Supabase's serverless pooler (`pgbouncer`) handles connection reuse. Do not open connections without this flag — cold-start connection storms will exhaust the pool.

### At 10,000 Audits/Day

The bottleneck is Supabase (500MB free tier). At ~2KB per `auditData` JSONB payload, the free tier supports ~250,000 audits before storage limits. For traffic scaling, move to Supabase Pro and enable read replicas for `/share/[slug]` pages (read-heavy). No changes needed to the Next.js layer.

---

## 17. Security Rules

These are non-negotiable for submission and production deployment.

1. **No secrets in the repository.** `.env.local` is in `.gitignore`. Run `git log --all -- .env.local` before submitting — if it appears, the commit history is compromised.

2. **No PII in logs.** Email addresses, company names, and role fields must never appear in Pino log output.

3. **No PII on the public share page.** The `/share/[slug]` page and `/api/og` route must only render tool names, plan names, savings numbers, and the AI summary. Strip everything else in the server fetch.

4. **Validate all inputs server-side.** Frontend validation (react-hook-form + Zod) is UX convenience only. Server-side Zod validation is the security gate.

5. **Rate limit before business logic.** The rate limit check in `POST /api/audit/submit` runs before Zod validation, DB access, and the audit engine.

6. **Never return DB row IDs unnecessarily.** Return only `auditId` (UUID) and `publicSlug`. Do not return internal DB metadata.

7. **`NEXT_PUBLIC_` variables are public.** Never assign `ANTHROPIC_API_KEY`, `DATABASE_URL`, `RESEND_API_KEY`, or `UPSTASH_REDIS_REST_TOKEN` to `NEXT_PUBLIC_` prefixed names.

8. **SQL injection is impossible with Drizzle ORM** (parameterized queries by default). Do not use raw SQL strings anywhere.

9. **Honeypot + rate limiting together.** Neither alone is sufficient. Both run on every `POST /api/audit/submit` request.

---

## 18. Implementation Checklist

Use this as a pre-submission backend QA gate. Every item must be checked before submitting.

### Database

- [ ] `audits` and `leads` tables created in Supabase via Drizzle migrations
- [ ] `prompt_logs` table created
- [ ] `public_slug` has a unique index
- [ ] `leads.audit_id` foreign key constraint is enforced
- [ ] `DATABASE_URL` set in Vercel environment variables (not `.env.local` only)

### API Routes

- [ ] `POST /api/audit/submit` returns `auditId`, `publicSlug`, `results`, `totalSavingsMonthly`, `totalSavingsAnnual`
- [ ] `POST /api/audit/submit` returns `400` for Zod validation failure
- [ ] `POST /api/audit/submit` returns `429` when rate limit is exceeded
- [ ] `GET /api/audit/summary` returns `{ summary, wasFallback }` — never a 500 from Anthropic failures
- [ ] `POST /api/leads/capture` is idempotent — second call with same `(auditId, email)` returns `200` without re-inserting or re-sending email
- [ ] `GET /api/og` has `export const runtime = 'edge'` and returns a PNG with correct `Content-Type`

### Audit Engine

- [ ] All 8 tools have a rule file in `src/lib/audit/rules/`
- [ ] All pricing constants are in `src/lib/audit/pricing.ts` (no hardcoded numbers in rule files)
- [ ] Each rule has a source URL comment citing `PRICING_DATA.md`
- [ ] `savingsPerMonth` is always `>= 0` in every rule (uses `Math.max(0, ...)`)
- [ ] The engine produces `status: 'optimal'` with `savingsPerMonth: 0` for optimal inputs
- [ ] No calls to Supabase, Anthropic, Resend, or any external service inside the engine
- [ ] `runAudit()` is a pure function — same input → same output, deterministically

### AI Summary

- [ ] Prompt is saved verbatim in `PROMPTS.md`
- [ ] Model is `claude-sonnet-4-20250514`
- [ ] `max_tokens` set to `200`
- [ ] AbortController timeout set to 10 seconds
- [ ] All Anthropic failures (429, 5xx, timeout, missing key) fall back to template
- [ ] Fallback template is human-quality prose, not obviously robotic
- [ ] Prompt and sanitized response are logged to `prompt_logs` table

### Email

- [ ] Resend `from` domain is verified in Resend dashboard (not `@gmail.com`)
- [ ] Email template renders correctly in dark-mode email clients
- [ ] Top 2 recommendations from audit appear in the email body
- [ ] Shareable URL appears in the email
- [ ] High-value users (savings > $500/mo) see Credex CTA in email
- [ ] Email failure does NOT cause lead save to fail or return 500 to client

### Rate Limiting & Security

- [ ] Upstash Redis credentials set in Vercel environment variables
- [ ] Rate limit: 5 submissions per IP per hour
- [ ] Honeypot field `website` is checked before Zod validation runs
- [ ] No secret variables are prefixed `NEXT_PUBLIC_`
- [ ] `.env.local` is in `.gitignore`
- [ ] `git log --all -- .env.local` returns nothing

### Tests

- [ ] `npm test` passes with 0 failures
- [ ] At least 5 tests exist in `src/lib/audit/__tests__/`
- [ ] GitHub Actions CI shows green checks on `main`
- [ ] Tests cover: savings calculation accuracy, no false savings, use-case routing, 0/1 seat edge cases, total equals sum invariant

### OG & Sharing

- [ ] `/share/[slug]` page renders without PII (no email, no company name)
- [ ] OG image shows savings figure prominently
- [ ] `generateMetadata()` returns correct `og:image` URL pointing to `/api/og?auditId=...`
- [ ] OG image response has `Cache-Control: public, max-age=86400`

---

*This document is the authoritative backend reference for the AI Spend Audit tool. Every implementation decision must be traceable to a guideline here or documented as a deviation in `DEVLOG.md` with explicit rationale. The backend's primary job is to be boring and correct — the audit engine's integrity is the product.*
