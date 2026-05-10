# TECHSTACK.md — AI Spend Audit Tool
### Technical Stack Reference — Credex Web Dev Intern Assignment

**Version:** 1.0  
**Last Updated:** 2026-05-07  
**Status:** Locked — Production-Ready

> This document defines the exact, versioned technical stack for the AI Spend Audit Tool. Every technology decision is final unless a deviation is logged in `DEVLOG.md` with explicit justification. This document is authoritative for all build, test, and deployment decisions.

---

## Table of Contents

1. [Stack Philosophy](#1-stack-philosophy)
2. [Frontend Stack](#2-frontend-stack)
3. [Backend Stack](#3-backend-stack)
4. [Infrastructure Stack](#4-infrastructure-stack)
5. [Dependency Version Lockfile Summary](#5-dependency-version-lockfile-summary)

---

## 1. Stack Philosophy

**Guiding constraint:** Everything must run on free tiers. Zero cost to build, deploy, and operate at MVP scale.

**Design principles applied to every technology decision:**

| Principle | Applied Meaning |
|---|---|
| **Free-tier first** | Every service chosen has a generous free tier that covers MVP traffic (thousands of audits/month). |
| **Minimal ops surface** | No self-managed servers, no Docker orchestration, no infra babysitting. Fully managed services only. |
| **TypeScript end-to-end** | The audit engine contains financial logic. Type safety is non-negotiable. |
| **Verifiable correctness** | The audit engine is pure deterministic functions — no AI inference, no stochastic outputs. Testable in full isolation. |
| **Speed to ship** | The stack optimizes for a 7-day deadline. Known, well-documented tools with large communities. |
| **Production parity** | Localhost environment mirrors production exactly. No "works on my machine" surprises. |

---

## 2. Frontend Stack

---

### 2.1 Framework — Next.js 14.2.x

**Exact version:** `next@14.2.29`

**Why chosen:**
Next.js with the App Router is the only sensible choice for this product given the requirements:
- The `/share/[auditId]` route requires proper Open Graph meta tags rendered server-side. Client-side rendering cannot produce crawlable OG tags — social link previews depend on SSR.
- API routes (`/api/*`) eliminate the need for a separate backend server. All backend logic (audit storage, email dispatch, rate limiting) lives in the same codebase and deploys as serverless functions.
- `@vercel/og` for OG image generation requires Next.js Edge Runtime — this integration is first-class and battle-tested.
- Vercel deployment is zero-config for Next.js. `git push` → live. No Dockerfile, no CI deploy scripts, no registry.
- The App Router's `loading.tsx` and `error.tsx` conventions map cleanly to the skeleton loader and error boundary requirements in `APPFLOW.md §8`.

**Scalability benefits:**
- Serverless functions scale to zero and burst automatically. No cold-start tuning needed at MVP traffic volumes.
- ISR (Incremental Static Regeneration) can be applied to the `/share/[auditId]` page if read traffic grows — the cached HTML serves from Vercel's edge CDN worldwide.
- At 10k audits/day, the bottleneck is the database (Supabase), not Next.js. The framework itself adds no scaling constraint.

**Performance considerations:**
- App Router enables React Server Components for pages that don't need interactivity (landing, share page). Zero JavaScript sent for static sections.
- Built-in image optimization (`next/image`) handles tool logo assets — auto-converts to WebP, lazy-loads, prevents layout shift.
- Lighthouse ≥ 85 performance target is achievable with default Next.js optimizations (font preloading, route prefetching, code splitting).

**Production suitability:**
Next.js 14 is the most production-deployed React meta-framework in existence. Used at Vercel, Notion, GitHub, and thousands of startups at scale. Security patches are rapid. The 14.x LTS line is stable.

---

### 2.2 Language — TypeScript 5.4.x

**Exact version:** `typescript@5.4.5`

**Why chosen:**
The audit engine is financial logic. It computes dollar amounts that are shown to users and used to make spending recommendations. A type error in the audit calculation is a product-correctness bug, not just a code quality issue. TypeScript's strict mode (`"strict": true`) makes the following impossible at compile time:
- Passing a `string` where a `number` (spend amount) is expected
- Forgetting to handle the `null` case for optional form fields
- Adding a new tool to the engine without updating the result type

TypeScript also enables IDE-level autocomplete for the audit rule types, making the rules file easier to maintain and audit.

**Scalability benefits:**
TypeScript scales with team size. When a second developer reads the codebase for Round 2 or a future hire, the types are self-documenting. No inline comments needed to explain what shape `AuditResult` is.

**Performance considerations:**
TypeScript compiles to JavaScript at build time. Zero runtime overhead. The `.d.ts` type declarations add nothing to the bundle.

**Production suitability:**
TypeScript is the default language for new Next.js projects as of Next.js 13. All type definitions for React, Node.js, and every library in this stack are maintained and current.

**tsconfig settings locked:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "target": "ES2022",
    "moduleResolution": "bundler"
  }
}
```

---

### 2.3 Styling System — Tailwind CSS 3.4.x

**Exact version:** `tailwindcss@3.4.17`

**Why chosen:**
- Utility-first CSS enables rapid, consistent UI construction without naming CSS classes.
- Tailwind's JIT compiler produces a minimal CSS bundle containing only the classes actually used in the codebase. A typical Next.js + Tailwind app ships 5–15 KB of CSS.
- The constraint in the assignment brief ("no admin dashboard templates") is trivially satisfied — Tailwind produces no pre-built components. Every visual decision is made by the developer.
- The `tailwind.config.ts` file is the single source of truth for the design token system (colors, spacing, typography scale, breakpoints). This directly implements the `frontend_guidelines.md` requirement.
- Responsive variants (`md:`, `lg:`) and dark mode (`dark:`) are built-in, no additional libraries needed.

**Scalability benefits:**
The CSS bundle size does not grow with application size — JIT ensures only used utilities are emitted. 100 pages and 3 pages ship the same CSS size.

**Performance considerations:**
CSS-in-JS alternatives (styled-components, Emotion) add JavaScript bundle weight and runtime style injection. Tailwind emits a static `.css` file — faster parse, no FOUC risk.

**Production suitability:**
Tailwind CSS 3.x is the most widely used CSS utility framework. Used by Vercel, GitHub, Shopify, and the majority of new Next.js projects.

**Additional Tailwind plugins:**
```
@tailwindcss/typography@0.5.15    — for the AI summary prose block
@tailwindcss/forms@0.5.9          — normalizes form element base styles across browsers
```

---

### 2.4 UI Component Library — shadcn/ui (latest as of 2026-05-07)

**Exact version:** `shadcn/ui` (not a versioned npm package — components are copied into `src/components/ui/` via the CLI)

**CLI version:** `shadcn@2.5.0`

**Why chosen:**
- shadcn/ui components are source-copied, not imported from a versioned dependency. This means zero runtime library overhead — only the components actually used exist in the bundle.
- All components are built on Radix UI primitives, which provide fully accessible, unstyled behavior (keyboard navigation, ARIA attributes, focus management). This directly satisfies the Lighthouse Accessibility ≥ 90 requirement with minimal extra work.
- Components are styled with Tailwind by default — they integrate seamlessly with the design token system.
- The components needed for this app are minimal: `Button`, `Input`, `Select`, `Dialog`, `Accordion`, `Badge`, `Skeleton`, `Toast` (via Sonner). No bloat from unused components.

**Specific components used:**

| Component | Usage |
|---|---|
| `Button` | All CTAs, form submissions, copy-link button |
| `Input` | Email capture form, spend amount fields |
| `Select` | Tool dropdown, plan dropdown |
| `Accordion` | FAQ section on landing page |
| `Badge` | Status badges (optimal / overspending / switch_recommended) |
| `Skeleton` | AI summary loading state |
| `Separator` | Card dividers in results |

**Scalability benefits:**
Since components are local source files, they can be customized arbitrarily without forking a library. No upstream breaking changes can affect the app.

**Performance considerations:**
Tree-shaken at build time. Only rendered component code is in the bundle.

**Production suitability:**
shadcn/ui is the de facto standard for new TypeScript React projects. Created by Vercel's design team. Actively maintained.

---

### 2.5 Animation Libraries

#### Primary: Framer Motion 11.x

**Exact version:** `framer-motion@11.18.2`

**Why chosen:**
The app requires several animation categories that are impractical with CSS alone:
- **Results page reveal:** Hero savings number should count up from 0 (number counter animation). This requires JavaScript-driven animation, not CSS transitions.
- **Per-tool card stagger:** Cards should appear sequentially (50ms stagger), giving a sense of computed results rolling in. CSS `animation-delay` can approximate this, but Framer Motion's `staggerChildren` variant system is cleaner and more maintainable.
- **Page transitions:** Smooth in/out between `/audit` and `/results/[auditId]` pages.
- **Micro-interactions:** Button hover states, badge pop-in, copy-confirmation checkmark.

**Scalability benefits:**
Framer Motion's layout animations handle dynamic content (tool cards added/removed in the form) without explicit coordinate calculations.

**Performance considerations:**
Framer Motion 11 uses the Web Animations API (WAAPI) where supported, offloading animations to the GPU compositor thread. Transforms and opacity animations do not trigger layout reflow.

**Production suitability:**
Framer Motion is used by Vercel, Linear, Loom, and most high-polish React apps. Version 11 supports React 18's concurrent features.

#### Secondary: CSS Transitions (native)

For simple hover states, focus rings, color transitions, and the navbar scroll effect — native CSS `transition` properties with Tailwind's `transition-*` utilities. No library overhead for simple state changes.

---

### 2.6 State Management — Zustand 4.5.x

**Exact version:** `zustand@4.5.7`

**Why chosen:**
The application has one meaningful cross-component state concern: the audit form data (tool rows, team size, use case) must persist across localStorage, flow into the audit engine, and sync to the running total bar. Zustand handles this with minimal boilerplate.

React's built-in `useState` would require deep prop drilling (form → running total bar → submit button) or React Context, which causes unnecessary re-renders across the form on every keystroke. Zustand's selective subscription (`useStore(state => state.tools)`) means only the running total re-renders when spend values change, not the entire form.

Redux Toolkit is overkill — the app has no complex action dispatching, no time-travel debugging needs, no middleware pipeline. Zustand provides the same derived state and subscription model in ~10x less code.

**State slices defined:**

```typescript
interface AuditFormStore {
  tools: ToolRow[]          // Array of { toolId, plan, seats, monthlySpend }
  teamSize: number
  useCase: UseCase
  addTool: (tool: ToolRow) => void
  removeTool: (toolId: string) => void
  updateTool: (toolId: string, updates: Partial<ToolRow>) => void
  setTeamSize: (n: number) => void
  setUseCase: (uc: UseCase) => void
  hydrate: () => void       // Loads from localStorage on mount
  persist: () => void       // Saves to localStorage
  clear: () => void         // Called after successful audit submission
}
```

**Scalability benefits:**
Zustand's middleware system (`persist`, `devtools`) allows adding localStorage sync and Redux DevTools without refactoring. The `persist` middleware from `zustand/middleware` handles the `localStorage` requirement from the PRD with one line.

**Performance considerations:**
Zustand uses a pub/sub model — components only re-render when the specific slice they subscribe to changes. No unnecessary re-renders.

**Production suitability:**
Zustand is the most downloaded "minimal state management" library in the React ecosystem. Used in production by Vercel, Miro, and thousands of SaaS products.

---

### 2.7 Data Fetching — TanStack Query 5.x (React Query)

**Exact version:** `@tanstack/react-query@5.64.2`

**Why chosen:**
The results page makes two asynchronous requests on mount:
1. Fetch the stored audit data from the backend (`GET /api/audits/[auditId]`)
2. Fetch the AI-generated summary (`GET /api/summary/[auditId]`)

These requests need: loading states (skeleton loaders), error states (fallback template for AI summary), retry logic (handle transient 500s), and deduplication (navigating back to the results page should not re-fetch). TanStack Query provides all four out of the box.

Without TanStack Query, this logic would be written by hand using `useEffect` + `useState` for loading/error/data — the standard approach that leads to race conditions and stale state bugs.

The `useQuery` hook also provides the `staleTime` option, which prevents re-fetching audit data that hasn't changed on every component mount.

**Scalability benefits:**
TanStack Query's cache invalidation system scales to complex multi-page apps without modification. The same `queryClient` instance serves all pages.

**Performance considerations:**
Request deduplication means identical queries from different components fire only once. Background refetch keeps data fresh without blocking the UI.

**Production suitability:**
TanStack Query v5 is the stable, actively maintained version. Used by thousands of production React apps.

---

### 2.8 Form Handling — React Hook Form 7.x

**Exact version:** `react-hook-form@7.54.2`

**Why chosen:**
The audit form has a dynamic, variable-length tool list. Each tool row has 4 fields (tool name, plan, seats, monthly spend), and users can add/remove rows. React Hook Form's `useFieldArray` hook handles exactly this pattern — dynamic form arrays with per-row validation.

Controlled inputs (React `useState` per field) re-render the entire form on every keystroke. React Hook Form uses uncontrolled inputs by default, meaning the form renders once and only re-renders on validation state changes. For a form with 5+ tool rows × 4 fields = 20+ inputs, this is a meaningful performance difference.

**Scalability benefits:**
`useFieldArray` scales to any number of dynamic rows with no performance degradation.

**Performance considerations:**
Uncontrolled inputs = no per-keystroke re-renders. On a mobile device with a slow processor, this difference is noticeable.

**Production suitability:**
React Hook Form is the most downloaded React form library. Version 7 supports React 18.

---

### 2.9 Validation — Zod 3.x

**Exact version:** `zod@3.24.2`

**Why chosen:**
Zod provides schema-first validation with TypeScript type inference. A single Zod schema serves three purposes simultaneously:
1. **Runtime validation** of the form submission payload (frontend)
2. **Runtime validation** of the incoming API request body (backend, in the Next.js API route)
3. **TypeScript type inference** — `z.infer<typeof AuditSubmissionSchema>` produces the TypeScript type automatically, eliminating schema/type drift

The `AuditSubmissionSchema` defined in `src/lib/schemas.ts` is imported by both the frontend form resolver and the backend API handler — one source of truth for what a valid audit submission looks like.

**Scalability benefits:**
Adding a new field to the audit form requires one change in one schema file. Types, validation, and API contract all update automatically.

**Performance considerations:**
Zod v3 is significantly faster than v2. Schema parsing for a typical audit submission (8 tool rows) takes < 1ms.

**Production suitability:**
Zod is the most widely used TypeScript validation library. Version 3 is the current stable.

**Integration:** Used as the React Hook Form resolver via `@hookform/resolvers@3.10.0`.

---

### 2.10 Charting — Recharts 2.x

**Exact version:** `recharts@2.15.1`

**Why chosen:**
The results page may include a visualization comparing current spend vs. recommended spend per tool (horizontal bar chart). Recharts is the most straightforward React-native charting library — components map 1:1 to chart elements, no imperative D3 manipulation needed.

Recharts renders to SVG, which is accessible (screen readers can traverse SVG), zoomable, and sharp at all pixel densities.

Alternatives considered:
- **Chart.js / react-chartjs-2:** Canvas-based. Not accessible, not crisp on high-DPI.
- **D3.js:** Too low-level for simple bar charts. No React integration.
- **Victory:** Similar to Recharts but smaller community, less maintained.

**Scalability benefits:**
SVG charts scale to any viewport without quality degradation. Recharts components are composable — adding a tooltip, legend, or reference line is a one-line addition.

**Performance considerations:**
For 8 tools maximum on the results page, Recharts adds no meaningful render cost. SVG with 8 bars is trivial.

**Production suitability:**
Recharts 2.x is actively maintained, compatible with React 18, and widely used in production dashboards.

---

### 2.11 Tables — TanStack Table 8.x

**Exact version:** `@tanstack/react-table@8.21.3`

**Why chosen:**
The per-tool breakdown on the results page is a table (tool, status, current spend, savings, recommended action). TanStack Table (formerly React Table) is a headless table library — it provides sorting, filtering, and pagination logic without imposing any UI. The visual design is entirely controlled via Tailwind utility classes.

For the MVP with a maximum of 8 tool rows, TanStack Table is admittedly heavy — a simple `<table>` with `<tr>` elements would work. It is chosen for consistency with the TanStack ecosystem already in use (TanStack Query) and because the `APPFLOW.md` specification for the results page implies a sortable/filterable table if the bonus features are implemented.

**Performance considerations:**
TanStack Table 8 is a complete rewrite that is dependency-free and framework-agnostic. It adds ~13 KB to the bundle.

**Production suitability:**
Used in production by thousands of data-heavy React apps. Version 8 supports React 18.

---

### 2.12 Testing Libraries

#### Unit / Integration: Vitest 2.x

**Exact version:** `vitest@2.1.9`

**Why chosen:**
The audit engine (`src/lib/auditEngine.ts`) is a pure TypeScript module — no DOM, no HTTP requests, no external dependencies. It is tested entirely with unit tests. Vitest is the fastest TypeScript-native test runner available:
- Shares the same Vite/esbuild transform pipeline as Next.js — no separate Babel config needed.
- Runs in-process (no `jest-environment-jsdom` overhead for pure function tests).
- Watch mode is near-instant (HMR-based, not full re-run).
- The `describe`/`it`/`expect` API is identical to Jest — zero learning curve.

Jest would also work but requires additional configuration for ESM + TypeScript in a Next.js 14 project. Vitest works out of the box.

**Minimum test coverage locked:**

| Test File | What It Covers |
|---|---|
| `auditEngine.test.ts` | All 5 required audit engine tests from `TESTS.md` |
| `savingsCalculation.test.ts` | Edge cases: 0 seats, 1 seat, sum equality |
| `rateLimit.test.ts` | Rate limiter logic (unit, mocked Redis) |
| `emailCapture.test.ts` | Idempotency of duplicate email submissions |
| `ogImage.test.ts` | OG image route renders without throwing |

#### Component Testing: React Testing Library 16.x

**Exact version:** `@testing-library/react@16.3.0`

**Why chosen:**
Tests for UI components (form validation messages, toast rendering, badge color logic) use React Testing Library, which tests from the user's perspective (by accessible role and text content) rather than implementation details.

**Configuration:**
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

Tests must pass with `npm test` as required by the assignment brief.

---

### 2.13 Upload Libraries — Not applicable

The AI Spend Audit Tool has no file upload feature in the MVP. No upload library is installed.

This is a deliberate decision: including unused dependencies increases bundle size, attack surface, and maintenance burden. If PDF export is implemented as a bonus feature, `jsPDF@2.5.2` will be added at that point.

---

### 2.14 Authentication Libraries — Not applicable

The PRD and `APPFLOW.md` explicitly state: "No page requires login. No page requires account creation." There is no authentication in the MVP.

No auth library (NextAuth, Clerk, Auth.js) is installed. Installing an auth library without using it adds 50–200 KB of dead bundle code and unnecessary environment variables.

---

## 3. Backend Stack

All backend logic runs as Next.js API routes (`/app/api/*/route.ts`) deployed as Vercel serverless functions. There is no separate backend server.

---

### 3.1 Runtime — Node.js 20.x (LTS)

**Exact version:** Node.js 20.19.x (Vercel's default for Next.js 14)

**Why chosen:**
- Node.js 20 is the current LTS (Long-Term Support) release. It receives security patches through April 2026.
- Vercel's serverless functions for Next.js 14 run on Node.js 20 by default. No configuration needed.
- The Anthropic SDK, Supabase client, and Resend SDK all have first-class Node.js 20 support.

**Performance considerations:**
Node.js 20 includes the V8 engine with Maglev (a new mid-tier JIT compiler), giving ~10–20% speedup on typical server-side JavaScript workloads versus Node.js 18.

---

### 3.2 Backend Framework — Next.js 14 API Routes (App Router)

**Exact version:** Same as frontend — `next@14.2.29`

**Why chosen:**
Co-locating backend API routes in the same Next.js project eliminates:
- A separate Express/Fastify server to deploy and maintain
- CORS configuration (same origin)
- Separate environment variable management
- Separate CI/CD pipeline

The API routes needed for this app are simple enough that a dedicated backend framework provides no meaningful benefit. Each route is a single exported function.

**API routes defined:**

| Route | Method | Purpose |
|---|---|---|
| `/api/audits` | `POST` | Receive audit submission, save to DB, return `auditId` |
| `/api/audits/[auditId]` | `GET` | Fetch stored audit result |
| `/api/summary/[auditId]` | `GET` | Return AI summary (calls Anthropic, returns text) |
| `/api/leads` | `POST` | Capture email lead, send confirmation email |
| `/api/share/[auditId]` | `GET` | Return anonymized audit for public share page |

**Scalability benefits:**
If traffic grows to the point where API routes become a bottleneck, they can be extracted to a dedicated Fastify service with no changes to the database schema, email service, or frontend. The interface (HTTP + JSON) is unchanged.

---

### 3.3 ORM — Drizzle ORM 0.30.x

**Exact version:** `drizzle-orm@0.30.10` + `drizzle-kit@0.21.4`

**Why chosen:**
Drizzle ORM is a TypeScript-native, lightweight ORM that compiles SQL at build time. It generates fully typed query results without runtime reflection.

Alternatives considered:
- **Prisma:** Generates a binary "query engine" that adds ~30 MB to the serverless function bundle. Vercel serverless functions have a 50 MB limit. Prisma cold starts on serverless are notoriously slow. Not suitable.
- **Kysely:** Similar to Drizzle, also excellent. Drizzle chosen for its `drizzle-kit` migration tool, which is more polished.
- **Raw SQL (pg):** Type-unsafe without additional tooling. Audit engine results have a known, complex type — ORM-generated types are safer.

**Performance considerations:**
Drizzle compiles to raw SQL with no runtime query parsing. Performance is identical to writing `pg` queries by hand.

**Production suitability:**
Drizzle ORM 0.30.x is production-stable. Used by Neon, Turso, and many Supabase-based projects.

---

### 3.4 Database — Supabase (PostgreSQL 15)

**Exact version:** Supabase PostgreSQL 15.x (managed — version is not configurable on free tier, but is fixed at 15.x)

**Client library:** `@supabase/supabase-js@2.47.3`

**Why chosen:**
Supabase's free tier provides:
- 500 MB database storage
- 2 GB bandwidth/month
- Row-level security (RLS) built in
- Real Postgres — not a proprietary query language, not a NoSQL store
- A managed connection pooler (PgBouncer) — critical for serverless functions, which cannot maintain persistent database connections

For this app's data model (audits table + leads table), 500 MB of storage is effectively unlimited at MVP scale. A single audit row is ~2 KB — 500 MB holds 250,000 audits.

Supabase is used in **database mode only** for this project:
- The Drizzle ORM connects directly to the Supabase Postgres instance via the connection string.
- Supabase's Auth, Storage, and Realtime features are **not used** — they add unnecessary complexity.

**Database schema:**

```sql
-- audits table
CREATE TABLE audits (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  form_data       JSONB NOT NULL,        -- raw form submission (tools, teamSize, useCase)
  audit_results   JSONB NOT NULL,        -- output of auditEngine() per tool
  total_monthly   NUMERIC(10, 2) NOT NULL,
  total_annual    NUMERIC(10, 2) NOT NULL,
  summary_text    TEXT,                  -- AI summary (nullable; written after Anthropic call)
  summary_source  TEXT CHECK (summary_source IN ('anthropic', 'fallback')),
  is_public       BOOLEAN NOT NULL DEFAULT TRUE
);

-- leads table
CREATE TABLE leads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id        UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  email           TEXT NOT NULL,
  company_name    TEXT,
  role            TEXT,
  team_size       INT,
  savings_tier    TEXT CHECK (savings_tier IN ('high', 'mid', 'low', 'optimal')),
  email_sent      BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (audit_id, email)               -- idempotency: one email per audit
);

-- indexes
CREATE INDEX idx_audits_created_at ON audits(created_at DESC);
CREATE INDEX idx_leads_audit_id ON leads(audit_id);
CREATE INDEX idx_leads_email ON leads(email);
```

**Scalability benefits:**
Postgres is the correct choice for this data model. JSONB columns for `form_data` and `audit_results` allow flexible schema evolution without migrations for every new tool added. Supabase's free tier scales to ~500 concurrent database connections via the built-in pooler.

---

### 3.5 Queue System — Not applicable (MVP)

No job queue is needed for the MVP. All operations are synchronous within the API route lifetime:

- Audit storage: synchronous write to Supabase, ~5ms
- Email dispatch: Resend API call, ~100ms, acceptable within serverless timeout
- AI summary: Anthropic API call with 10s timeout; handled directly in the summary API route

A queue system (BullMQ, Upstash QStash) would be needed if:
- Email volume required batching (>10k/month on free tier)
- AI summary generation needed to be retried with exponential backoff (currently handled client-side by TanStack Query's `retry` option)

This decision is logged as a known scaling gap — `ARCHITECTURE.md §What changes at 10k audits/day` addresses it.

---

### 3.6 Caching — Upstash Redis (Free tier)

**Exact version:** `@upstash/redis@1.34.3`

**Why chosen:**
Redis is used for exactly one purpose: **rate limiting**. Each email capture request is limited to 5 submissions per IP address per hour. This requires atomic increment + TTL operations that cannot be done correctly with the database (race conditions in serverless functions that share no in-memory state).

Upstash Redis provides:
- A serverless-compatible REST API (no persistent TCP connection needed)
- 10,000 requests/day free
- Atomic `INCR` + `EXPIRE` operations

The rate limiter uses the `@upstash/ratelimit@2.0.5` library, which wraps the sliding window algorithm:

```typescript
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  prefix: "ratelimit:leads"
});
```

**Caching strategy (secondary use):**
The AI summary for a given `auditId` is cached in Redis with a 24-hour TTL after the first Anthropic API call. Subsequent loads of the same results page serve the cached summary without hitting the Anthropic API.

| Cache Key | TTL | Value |
|---|---|---|
| `summary:{auditId}` | 24 hours | AI summary text string |
| `ratelimit:leads:{ip}` | 1 hour | Request count (managed by Upstash Ratelimit) |

**Performance considerations:**
Upstash Redis latency from Vercel's US-East serverless functions is ~5ms. Negligible.

**Production suitability:**
Upstash is the standard Redis solution for Vercel/Next.js deployments. Used by thousands of production Next.js apps.

---

### 3.7 Validation Libraries — Zod 3.x (shared with frontend)

**Exact version:** `zod@3.24.2` (same package, used in both frontend and backend contexts)

The same Zod schemas defined in `src/lib/schemas.ts` are imported in API route handlers to validate incoming request bodies. No separate backend validation library is needed. See §2.9 for full rationale.

---

### 3.8 Logging Libraries — Pino 9.x

**Exact version:** `pino@9.6.0` + `pino-pretty@13.0.0` (dev only)

**Why chosen:**
Pino is the fastest Node.js structured logger. It serializes logs as newline-delimited JSON, which Vercel's log aggregation system reads natively.

Logs are written in the API routes for:
- Audit submission received (with `auditId`, `totalMonthly`, `toolCount`)
- AI summary requested (with `auditId`, model used)
- AI summary failed (with `auditId`, error code, fallback used)
- Lead captured (with `auditId`, `savingsTier`, company domain — no PII)
- Rate limit hit (with IP hash — never raw IP)

PII policy: Email addresses and company names are **never logged**. Only derived metadata (savings tier, domain, tool count) is logged.

**Performance considerations:**
Pino is 5–10x faster than Winston for high-throughput logging. For serverless functions processing one request at a time, this is not the bottleneck — but Pino's JSON output format is the standard for cloud log aggregation.

---

### 3.9 API Documentation — No external tool (OpenAPI via JSDoc)

API routes are documented inline using OpenAPI-style JSDoc comments. At MVP scale with 5 routes, a dedicated API docs tool (Swagger UI, Scalar) is unnecessary operational overhead.

The `ARCHITECTURE.md` file serves as the human-readable API reference.

---

### 3.10 Authentication — Not applicable

No authentication layer exists in the MVP. See §2.14 for rationale.

---

### 3.11 AI SDKs — Anthropic SDK 0.39.x

**Exact version:** `@anthropic-ai/sdk@0.39.0`

**Why chosen:**
The assignment brief specifies: "Use the Anthropic API (preferred)." The official Anthropic TypeScript SDK provides:
- Typed request/response objects for the Messages API
- Built-in retry logic with exponential backoff
- Streaming support (not used in MVP, but available)
- AbortSignal support for the 10-second timeout requirement

**Model used:** `claude-sonnet-4-20250514` (as specified in `PRD.md §5.4`)

**Usage pattern:**
```typescript
// In /api/summary/[auditId]/route.ts
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const message = await anthropic.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 256,
  messages: [{ role: "user", content: summaryPrompt }]
}, { signal: AbortSignal.timeout(10_000) }); // 10s timeout
```

**Fallback:** If the SDK throws (429, 500, timeout, API key missing), the `generateFallbackSummary()` function produces a templated string. The error is logged (without PII) via Pino.

**Free credits:** Anthropic provides free API credits for students and hackathon participants. Applied for via https://www.anthropic.com/contact.

---

### 3.12 Background Job Processing — Resend Webhooks (minimal)

No dedicated background job processor (BullMQ, Inngest) is used in the MVP. Email sending is synchronous within the `/api/leads` route.

If Resend's email delivery fails, the lead is still saved to the database with `email_sent = false`. A retry mechanism can be implemented in a future iteration by querying for `email_sent = false` leads and re-sending.

---

### 3.13 Email Service — Resend

**Exact version:** `resend@4.1.2`

**Why chosen:**
Resend is the highest-quality transactional email service with a developer-focused API:
- 3,000 emails/month free (100/day)
- React Email templates — confirmation email is a React component, styled consistently with the app
- The `resend.emails.send()` API is one function call
- Deliverability is excellent (SPF/DKIM configured automatically via DNS)
- Next.js + Resend is the most documented combination in the ecosystem

**React Email version:** `@react-email/components@0.0.22`

---

## 4. Infrastructure Stack

---

### 4.1 Frontend Hosting — Vercel (Free/Hobby tier)

**Why chosen:**
Vercel is the canonical deployment target for Next.js applications. It was created by the same team. Features used:
- Zero-config deployment from GitHub
- Preview URLs for every PR
- Built-in Edge CDN — static assets served from 100+ PoPs worldwide
- `@vercel/og` for OG image generation on Edge Runtime
- Automatic HTTPS (TLS termination at edge)
- Serverless function deployment for API routes

**Free tier limits:** 100 GB bandwidth/month, 100 serverless function invocations/day on the hobby tier. At MVP launch, daily traffic is expected in the dozens to low hundreds. Well within limits.

**Scalability benefits:**
Vercel's Pro tier ($20/month, if upgrade needed) provides unlimited bandwidth, 1M function invocations/month, and team collaboration. Upgrade is one click.

---

### 4.2 Backend Hosting — Vercel Serverless Functions

**Same as §4.1.** Backend and frontend are co-deployed in the same Vercel project. API routes run as serverless functions in the same region (us-east-1 by default).

No separate backend hosting is needed.

---

### 4.3 Database Hosting — Supabase (Free tier)

**Same as §3.4.** Supabase's managed Postgres cluster is the database host. The free tier includes:
- 500 MB database storage
- 2 GB bandwidth
- Daily automated backups (7-day retention)
- Connection pooler (PgBouncer)

**Region:** `us-east-1` — same region as Vercel functions to minimize latency.

---

### 4.4 CDN — Vercel Edge Network

Included in Vercel hosting. Static assets (JS, CSS, images) are served from Vercel's CDN. Tool logos, fonts, and other static files in `/public` are automatically edge-cached.

No separate CDN provider is configured. Vercel's CDN is sufficient for all static asset delivery at MVP scale.

---

### 4.5 Storage — Not applicable

No file storage is required in the MVP. There are no user uploads, no stored PDFs, no media uploads.

If the PDF export bonus feature is implemented, it runs client-side (jsPDF in the browser) and the PDF is downloaded directly — no server storage needed.

---

### 4.6 CI/CD — GitHub Actions

**Exact file:** `.github/workflows/ci.yml`

**Why chosen:**
GitHub Actions is free for public repositories (unlimited) and integrates natively with the GitHub repo required by the assignment. No external CI service (CircleCI, Travis) is needed.

**Pipeline definition:**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm test
```

**Checks enforced:**
- `npm run lint` — ESLint with `eslint-config-next@14.2.29`
- `npm test` — Vitest test suite (audit engine + edge cases)

Green checks on `main` branch are required by the assignment brief.

---

### 4.7 Monitoring — Vercel Analytics + Vercel Speed Insights

**Package versions:** Built into Vercel dashboard (no npm package needed for basic analytics)

**Why chosen:**
Vercel's built-in analytics provides:
- Page view tracking (no cookie consent required — privacy-friendly, IP-anonymized)
- Core Web Vitals per route (LCP, CLS, FID)
- Serverless function duration and error rate

This provides the minimum monitoring needed for the MVP with zero setup cost.

For error tracking, Next.js 14's built-in `error.tsx` boundary catches client-side rendering errors. Server-side errors are logged via Pino and visible in Vercel's function logs.

**What would be added at scale:** Sentry (`@sentry/nextjs@8.x`) for full error tracking and alerting. Not installed in MVP — Vercel logs are sufficient.

---

### 4.8 Analytics — Plausible Analytics (Free self-hosted or cloud)

**Why chosen:**
Product analytics (tracking form completion rates, audit-to-email-capture conversion, share button click rate) are needed for the `METRICS.md` North Star tracking.

Plausible is a privacy-first analytics tool:
- No cookies required (GDPR compliant by default)
- Lightweight script (~1 KB vs Google Analytics' ~30 KB)
- Tracks custom events (`audit_completed`, `email_captured`, `share_link_copied`)
- Free cloud trial: 30 days, then $9/month. **Alternative:** Self-hosted on a free Fly.io instance.

**Custom events tracked:**

| Event | Trigger |
|---|---|
| `audit_started` | User lands on `/audit` |
| `tool_added` | User clicks "+ Add tool" |
| `audit_submitted` | User clicks "Run Audit" |
| `email_captured` | User submits email |
| `share_link_copied` | User clicks copy link button |
| `credex_cta_clicked` | User clicks Credex consultation link |

**Implementation:** Script tag in `app/layout.tsx`. Custom events fired via `plausible()` calls.

---

### 4.9 Environment Management — `.env.local` + Vercel Environment Variables

**Environment files:**

| File | Purpose |
|---|---|
| `.env.local` | Local development secrets (never committed) |
| `.env.example` | Committed template showing required variable names with no values |
| Vercel dashboard | Production + preview environment variables |

**Required environment variables:**

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

**Security:** No secret is ever committed to the repository. `.env.local` is in `.gitignore`. The `.env.example` file contains only variable names, no values.

---

### 4.10 Secrets Management — Vercel Dashboard (built-in)

Vercel's environment variable system encrypts secrets at rest and injects them into serverless functions at runtime. No external secrets manager (AWS Secrets Manager, HashiCorp Vault) is needed at this scale.

**Access control:** Only the repository owner (and Vercel project collaborators) can view or edit environment variables in the Vercel dashboard.

---

## 5. Dependency Version Lockfile Summary

The following table lists every production dependency with its locked version. These exact versions are pinned in `package.json`. The `package-lock.json` is committed to the repository.

### Production Dependencies

| Package | Version | Category |
|---|---|---|
| `next` | `14.2.29` | Framework |
| `react` | `18.3.1` | Framework |
| `react-dom` | `18.3.1` | Framework |
| `typescript` | `5.4.5` | Language |
| `tailwindcss` | `3.4.17` | Styling |
| `@tailwindcss/typography` | `0.5.15` | Styling plugin |
| `@tailwindcss/forms` | `0.5.9` | Styling plugin |
| `framer-motion` | `11.18.2` | Animation |
| `zustand` | `4.5.7` | State management |
| `@tanstack/react-query` | `5.64.2` | Data fetching |
| `react-hook-form` | `7.54.2` | Form handling |
| `@hookform/resolvers` | `3.10.0` | Form/Zod bridge |
| `zod` | `3.24.2` | Validation |
| `recharts` | `2.15.1` | Charting |
| `@tanstack/react-table` | `8.21.3` | Tables |
| `drizzle-orm` | `0.30.10` | ORM |
| `@supabase/supabase-js` | `2.47.3` | Database client |
| `@upstash/redis` | `1.34.3` | Caching/Rate limit |
| `@upstash/ratelimit` | `2.0.5` | Rate limiting |
| `@anthropic-ai/sdk` | `0.39.0` | AI SDK |
| `resend` | `4.1.2` | Email |
| `@react-email/components` | `0.0.22` | Email templates |
| `pino` | `9.6.0` | Logging |
| `@vercel/og` | `0.6.4` | OG image generation |

### Development Dependencies

| Package | Version | Category |
|---|---|---|
| `vitest` | `2.1.9` | Testing |
| `@testing-library/react` | `16.3.0` | Component testing |
| `@testing-library/user-event` | `14.5.2` | Component testing |
| `@vitejs/plugin-react` | `4.3.4` | Vitest config |
| `drizzle-kit` | `0.21.4` | DB migrations |
| `eslint` | `8.57.1` | Linting |
| `eslint-config-next` | `14.2.29` | Linting |
| `pino-pretty` | `13.0.0` | Dev log formatting |
| `shadcn` | `2.5.0` (CLI) | Component scaffolding |

---

*This document is the authoritative technical reference for the AI Spend Audit Tool. Any deviation from the versions or technologies specified here must be documented in `DEVLOG.md` with explicit justification. The stack is designed to be fully buildable and deployable at zero cost on the free tiers of every service listed.*
