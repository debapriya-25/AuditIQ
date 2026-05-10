# AuditIQ — Implementation Plan
### Complete Execution Blueprint for Developers, Contributors, AI Coding Assistants & Future Maintainers

**Version:** 1.0  
**Project:** AuditIQ — AI-Powered Spend Audit & Financial Monitoring Web Application  
**Prepared for:** Credex Web Dev Intern Assignment  
**Stack:** Next.js 14 · TypeScript · Tailwind CSS · shadcn/ui · Supabase · Drizzle ORM · Upstash Redis · Resend · Anthropic API · Vercel  
**Deployment target:** 100% free tier — zero cost to build, deploy, and operate at MVP scale  
**Last updated:** 2026-05-10

---

## Table of Contents

1. [Project Overview & Architecture Summary](#1-project-overview--architecture-summary)
2. [Prerequisites & One-Time Account Setup](#2-prerequisites--one-time-account-setup)
3. [Phase 0 — Repository & Toolchain Bootstrap](#phase-0--repository--toolchain-bootstrap)
4. [Phase 1 — Project Scaffolding & Configuration](#phase-1--project-scaffolding--configuration)
5. [Phase 2 — Database Design & Migration](#phase-2--database-design--migration)
6. [Phase 3 — Core Type System & Shared Infrastructure](#phase-3--core-type-system--shared-infrastructure)
7. [Phase 4 — Audit Engine (Deterministic Rules)](#phase-4--audit-engine-deterministic-rules)
8. [Phase 5 — API Routes (Backend)](#phase-5--api-routes-backend)
9. [Phase 6 — Frontend: Design System & Global Layout](#phase-6--frontend-design-system--global-layout)
10. [Phase 7 — Landing Page (`/`)](#phase-7--landing-page-)
11. [Phase 8 — Spend Input Form (`/audit`)](#phase-8--spend-input-form-audit)
12. [Phase 9 — Audit Results Page (`/results/[auditId]`)](#phase-9--audit-results-page-resultsauditid)
13. [Phase 10 — Share Page (`/share/[auditId]`)](#phase-10--share-page-shareauditid)
14. [Phase 11 — Email Confirmation & Ancillary Pages](#phase-11--email-confirmation--ancillary-pages)
15. [Phase 12 — OG Image Generation](#phase-12--og-image-generation)
16. [Phase 13 — Security Hardening](#phase-13--security-hardening)
17. [Phase 14 — Automated Testing](#phase-14--automated-testing)
18. [Phase 15 — CI/CD Pipeline](#phase-15--cicd-pipeline)
19. [Phase 16 — Required Documentation Files](#phase-16--required-documentation-files)
20. [Phase 17 — Deployment to Vercel](#phase-17--deployment-to-vercel)
21. [Phase 18 — Post-Deployment Verification](#phase-18--post-deployment-verification)
22. [Phase 19 — Bonus Features (Post-MVP)](#phase-19--bonus-features-post-mvp)
23. [Complete File & Folder Structure Reference](#complete-file--folder-structure-reference)
24. [Environment Variables Reference](#environment-variables-reference)
25. [Day-by-Day Execution Schedule (7-Day Plan)](#day-by-day-execution-schedule-7-day-plan)
26. [Evaluation Rubric Alignment Checklist](#evaluation-rubric-alignment-checklist)

---

## 1. Project Overview & Architecture Summary

### What AuditIQ Does

AuditIQ is a free, no-login web tool that audits startup AI tool subscriptions and tells them exactly where they're overspending, what to switch or downgrade, and how much they'd save per month and per year. A user enters their current AI subscriptions (tool, plan, seats, monthly cost). A deterministic rule-based engine evaluates each tool against verified pricing data, produces a per-tool breakdown with status (`optimal` / `overspending` / `switch_recommended`), and renders a hero total of monthly + annual savings. The Anthropic API generates a 100-word personalized narrative summary. The result page receives a unique public URL for sharing. After seeing results, the user optionally submits their email to receive a confirmation and — for high-savings cases — a Credex consultation CTA.

### System Architecture (Request Flow)

```
Browser (untrusted)
  │  HTTPS only
  ▼
Vercel Edge CDN
  │
  ├─► Next.js App Router (React Server Components + Client Components)
  │       /                    → Landing page (SSR)
  │       /audit               → Spend input form (Client Component, localStorage)
  │       /results/[auditId]   → Private results (SSR + client fetch for AI summary)
  │       /share/[auditId]     → Public anonymized results (SSR + OG tags)
  │       /confirmed           → Post-email-capture confirmation (static)
  │
  ├─► Next.js API Routes (Serverless Functions)
  │       POST /api/audit/submit      → Validate → Run Engine → Save → Return
  │       GET  /api/audit/summary     → Fetch audit → Call Anthropic → Return
  │       POST /api/leads/capture     → Validate → Idempotency → Save → Send Email
  │       GET  /api/og                → Fetch audit → Generate OG image (Edge Runtime)
  │
  ├─► Supabase (PostgreSQL)
  │       audits table         → Full audit payloads, public slugs
  │       leads table          → Captured emails + metadata
  │       prompt_logs table    → Anthropic prompt/response logs (sanitized)
  │
  ├─► Upstash Redis             → Rate limiting (5 audits/IP/hour)
  ├─► Anthropic API             → AI narrative summary (claude-sonnet-4-20250514)
  └─► Resend                    → Transactional confirmation email
```

### Services & Free Tier Limits

| Service | Role | Free Tier |
|---|---|---|
| Vercel | Hosting + serverless functions | 100 GB bandwidth, 100k function calls/day |
| Supabase | PostgreSQL database | 500 MB storage, 2 GB transfer/month |
| Upstash Redis | Rate limiting | 10,000 requests/day |
| Anthropic API | AI summary (claude-sonnet-4-20250514) | Pay-per-use (~$5 for MVP) |
| Resend | Transactional email | 3,000 emails/month |
| GitHub | Version control + CI | Unlimited (public repo) |
| GitHub Actions | CI/CD pipeline | Unlimited (public repo) |

**Total monthly cost at MVP scale: $0**

---

## 2. Prerequisites & One-Time Account Setup

Complete all of the following before writing a single line of code. Each account is free and required.

### 2.1 Local Development Tools

Verify the following are installed locally:

```bash
node --version    # Must be >= 20.x (LTS)
npm --version     # >= 10.x (comes with Node 20)
git --version     # >= 2.40
```

If Node is not installed, use [nvm](https://github.com/nvm-sh/nvm):
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 20
nvm use 20
```

### 2.2 Service Account Registration (All Free)

**Step 1 — GitHub**  
- Go to https://github.com/signup and create an account (or use an existing one).  
- Create a new **public** repository named `auditiq` (or `ai-spend-audit`).  
- Copy the repo's HTTPS clone URL.

**Step 2 — Vercel**  
- Go to https://vercel.com/signup  
- Sign up with your GitHub account (OAuth).  
- This links Vercel to your GitHub automatically.  
- No credit card required for the Hobby plan (free tier).

**Step 3 — Supabase**  
- Go to https://supabase.com/dashboard/sign-up  
- Sign up with GitHub OAuth.  
- Create a new **Project** → choose any region close to your users → note the project password (save it).  
- Wait 1–2 minutes for the project to provision.  
- From Project Settings → Database → Connection string, copy the **URI** (uses `postgres://...` format). Replace `[YOUR-PASSWORD]` with the password you set.  
- From Project Settings → API, copy:  
  - `Project URL` → this is `NEXT_PUBLIC_SUPABASE_URL`  
  - `anon public` key → this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Step 4 — Upstash Redis**  
- Go to https://console.upstash.com and sign up (free, no credit card).  
- Create a new **Redis** database → choose the region closest to your Vercel deployment region.  
- From the database detail page, copy:  
  - `UPSTASH_REDIS_REST_URL`  
  - `UPSTASH_REDIS_REST_TOKEN`

**Step 5 — Resend**  
- Go to https://resend.com/signup and create a free account.  
- From the dashboard → API Keys → Create API Key → copy it as `RESEND_API_KEY`.  
- For the sender address, you can use Resend's shared domain during development: `onboarding@resend.dev`. For production, add and verify your own domain (free in Resend).

**Step 6 — Anthropic**  
- Go to https://console.anthropic.com and create an account.  
- Add a small balance (minimum $5) — this is pay-per-use; the entire MVP will cost less than $2.  
- From the console → API Keys → Create Key → copy it as `ANTHROPIC_API_KEY`.  
- **Important:** Go to Billing → Usage Limits → set monthly hard limit to $10 to prevent runaway spend.

### 2.3 Verify All Keys Are Collected

Before proceeding, confirm you have all six secrets:
```
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
DATABASE_URL=postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxx...
RESEND_API_KEY=re_...
NEXT_PUBLIC_APP_URL=http://localhost:3000  ← change to production URL after deploy
```

---

## Phase 0 — Repository & Toolchain Bootstrap

**Goal:** A cloned, initialized repository with Git history started and `.gitignore` protecting secrets.

### Step 0.1 — Clone and Initialize the Repo

```bash
# Clone your empty GitHub repo
git clone https://github.com/YOUR_USERNAME/auditiq.git
cd auditiq

# Verify git is tracking the right remote
git remote -v
```

### Step 0.2 — Create `.gitignore` First (Before Any File is Committed)

Create `.gitignore` at the repo root **before anything else**:

```gitignore
# Dependencies
node_modules/
.npm/

# Build outputs
.next/
out/
dist/

# Environment files — NEVER commit these
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Editor / OS
.DS_Store
*.swp
.idea/
.vscode/settings.json

# Logs
*.log
pino.log

# Test coverage
coverage/
.nyc_output/

# Vercel
.vercel/
```

### Step 0.3 — Create `.env.example` (Committed Template)

```bash
# .env.example — committed to repo; no real values
ANTHROPIC_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DATABASE_URL=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
NEXT_PUBLIC_APP_URL=
```

### Step 0.4 — First Commit

```bash
git add .gitignore .env.example
git commit -m "chore: initialize repo with gitignore and env template"
git push origin main
```

### Step 0.5 — Create `.env.local` (Never Committed)

```bash
# Copy the template and fill in real values
cp .env.example .env.local
# Now open .env.local in your editor and paste all six secrets
```

---

## Phase 1 — Project Scaffolding & Configuration

**Goal:** A working Next.js 14 App Router project with TypeScript, Tailwind, shadcn/ui installed and verified running locally.

### Step 1.1 — Create Next.js App

```bash
npx create-next-app@14.2.29 . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-git    # We already have a git repo
```

When prompted, confirm the following choices:
- TypeScript: **Yes**
- ESLint: **Yes**
- Tailwind CSS: **Yes**
- `src/` directory: **Yes**
- App Router: **Yes**
- Import alias `@/*`: **Yes**

### Step 1.2 — Install All Production Dependencies

Install in a single command to ensure dependency resolution works correctly:

```bash
npm install \
  framer-motion@11.18.2 \
  zustand@4.5.7 \
  @tanstack/react-query@5.64.2 \
  react-hook-form@7.54.2 \
  @hookform/resolvers@3.10.0 \
  zod@3.24.2 \
  recharts@2.15.1 \
  @tanstack/react-table@8.21.3 \
  drizzle-orm@0.30.10 \
  postgres@3.4.4 \
  @supabase/supabase-js@2.47.3 \
  @upstash/redis@1.34.3 \
  @upstash/ratelimit@2.0.5 \
  @anthropic-ai/sdk@0.39.0 \
  resend@4.1.2 \
  @react-email/components@0.0.22 \
  pino@9.6.0 \
  @vercel/og@0.6.4 \
  nanoid@5.0.9 \
  @tailwindcss/typography@0.5.15 \
  @tailwindcss/forms@0.5.9
```

### Step 1.3 — Install Dev Dependencies

```bash
npm install --save-dev \
  vitest@2.1.9 \
  @testing-library/react@16.3.0 \
  @testing-library/user-event@14.5.2 \
  @vitejs/plugin-react@4.3.4 \
  drizzle-kit@0.21.4 \
  pino-pretty@13.0.0 \
  @types/node@20.x \
  jsdom@24.x
```

### Step 1.4 — Install shadcn/ui CLI and Initialize

```bash
npx shadcn@2.5.0 init
```

When prompted:
- Style: **Default**
- Base color: **Slate** (we'll override everything in globals.css anyway)
- Global CSS: `src/app/globals.css`
- CSS variables: **Yes**
- Tailwind config: `tailwind.config.ts`
- Components alias: `@/components`
- Utils alias: `@/lib/utils`

Then install each component used in this project:

```bash
npx shadcn@2.5.0 add button input select accordion badge skeleton separator sonner
```

### Step 1.5 — Configure `tsconfig.json`

Replace the generated `tsconfig.json` with the strict configuration:

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "target": "ES2022",
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Step 1.6 — Configure Tailwind (`tailwind.config.ts`)

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        void:    '#080C14',
        abyss:   '#0D1320',
        depth:   '#141B2D',
        surface: '#1C2540',
        overlay: '#232E4F',
        // Accent palette
        'neon-green':  '#00FF87',
        'neon-amber':  '#FFB800',
        'neon-red':    '#FF4D4D',
        'neon-blue':   '#4D9EFF',
        'glass-white': 'rgba(255,255,255,0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backdropBlur: {
        glass: '12px',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1)',
        'glass-lg': '0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)',
        savings: '0 0 40px rgba(0,255,135,0.2)',
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
        'count-up': 'countUp 0.8s ease-out forwards',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
};

export default config;
```

### Step 1.7 — Configure `globals.css`

Replace the generated `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-void:    #080C14;
  --color-abyss:   #0D1320;
  --color-depth:   #141B2D;
  --color-surface: #1C2540;
  --color-overlay: #232E4F;

  --glass-bg:     rgba(20, 27, 45, 0.65);
  --glass-border: rgba(255, 255, 255, 0.10);
  --glass-blur:   12px;

  --savings-green: #00FF87;
  --warning-amber: #FFB800;
  --danger-red:    #FF4D4D;
  --info-blue:     #4D9EFF;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  background-color: var(--color-void);
  color: #E2E8F0;
  font-family: 'Inter', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* Glass card base utility */
@layer components {
  .glass-card {
    background: var(--glass-bg);
    backdrop-filter: blur(var(--glass-blur));
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06);
  }

  .savings-number {
    font-size: clamp(2.5rem, 8vw, 5rem);
    font-weight: 800;
    color: var(--savings-green);
    text-shadow: 0 0 40px rgba(0,255,135,0.4);
    letter-spacing: -0.02em;
  }

  .shimmer-bar {
    background: linear-gradient(
      90deg,
      var(--color-surface) 25%,
      var(--color-overlay) 50%,
      var(--color-surface) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
}
```

### Step 1.8 — Configure `next.config.ts`

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pino', 'postgres'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
```

### Step 1.9 — Configure Vitest (`vitest.config.ts`)

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: { '@': resolve(__dirname, './src') },
  },
});
```

Create `src/test/setup.ts`:
```typescript
import '@testing-library/jest-dom';
```

### Step 1.10 — Update `package.json` Scripts

Add/replace scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "db:generate": "drizzle-kit generate:pg",
    "db:push": "drizzle-kit push:pg",
    "db:studio": "drizzle-kit studio",
    "typecheck": "tsc --noEmit"
  }
}
```

### Step 1.11 — Configure Drizzle (`drizzle.config.ts`)

```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/db/schema.ts',
  out: './src/lib/db/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

### Step 1.12 — Verify the Dev Server Starts

```bash
npm run dev
# Open http://localhost:3000 — should show Next.js default page
# Ctrl+C to stop

npm run typecheck   # Should pass with no errors
npm run lint        # Should pass (no custom rules broken yet)
```

### Step 1.13 — Commit Scaffold

```bash
git add -A
git commit -m "feat: scaffold Next.js 14 project with TypeScript, Tailwind, shadcn/ui"
git push origin main
```

---

## Phase 2 — Database Design & Migration

**Goal:** All three Supabase tables created, migrated, and verified from local dev.

### Step 2.1 — Create Drizzle Schema (`src/lib/db/schema.ts`)

```typescript
import {
  pgTable, uuid, text, numeric, integer,
  boolean, timestamp, jsonb, index
} from 'drizzle-orm/pg-core';

export const audits = pgTable('audits', {
  id:                  uuid('id').primaryKey().defaultRandom(),
  auditData:           jsonb('audit_data').notNull(),
  useCase:             text('use_case').notNull(),
  totalSavingsMonthly: numeric('total_savings_monthly').notNull(),
  createdAt:           timestamp('created_at').defaultNow().notNull(),
  publicSlug:          text('public_slug').unique().notNull(),
}, (table) => ({
  publicSlugIdx: index('audits_public_slug_idx').on(table.publicSlug),
}));

export const leads = pgTable('leads', {
  id:           uuid('id').primaryKey().defaultRandom(),
  email:        text('email').notNull(),
  companyName:  text('company_name'),
  role:         text('role'),
  teamSize:     integer('team_size'),
  auditId:      uuid('audit_id').references(() => audits.id).notNull(),
  createdAt:    timestamp('created_at').defaultNow().notNull(),
  savingsPerMonth: numeric('savings_per_month').notNull(),
  highValue:    boolean('high_value').notNull().default(false),
  notifyOnly:   boolean('notify_only').notNull().default(false),
}, (table) => ({
  auditIdIdx: index('leads_audit_id_idx').on(table.auditId),
  emailIdx:   index('leads_email_idx').on(table.email),
}));

export const promptLogs = pgTable('prompt_logs', {
  id:          uuid('id').primaryKey().defaultRandom(),
  auditId:     uuid('audit_id').references(() => audits.id).notNull(),
  prompt:      text('prompt').notNull(),
  response:    text('response'),
  modelUsed:   text('model_used').notNull(),
  durationMs:  integer('duration_ms'),
  wasError:    boolean('was_error').notNull().default(false),
  errorReason: text('error_reason'),
  createdAt:   timestamp('created_at').defaultNow().notNull(),
});
```

### Step 2.2 — Create DB Client (`src/lib/db/client.ts`)

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

function getConnectionString(): string {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL environment variable is not set.');
  return url;
}

// Disable prepare for serverless (Supabase has its own pooler)
const client = postgres(getConnectionString(), { prepare: false });

export const db = drizzle(client, { schema });
```

### Step 2.3 — Generate and Push Migrations

```bash
# Generate migration SQL from schema
npm run db:generate

# Push to Supabase (this creates the tables)
npm run db:push
```

If `db:push` fails, ensure `DATABASE_URL` is set in `.env.local` and includes `?sslmode=require` if needed:
```
DATABASE_URL=postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres
```

### Step 2.4 — Enable Row Level Security (RLS) in Supabase

Go to Supabase Dashboard → SQL Editor → Run the following:

```sql
-- Enable RLS on all tables
ALTER TABLE audits      ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads       ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_logs ENABLE ROW LEVEL SECURITY;

-- No anon access — all queries go through service_role (DATABASE_URL)
-- anon role: deny all
CREATE POLICY "deny_anon_audits"      ON audits      FOR ALL TO anon USING (false);
CREATE POLICY "deny_anon_leads"       ON leads       FOR ALL TO anon USING (false);
CREATE POLICY "deny_anon_prompt_logs" ON prompt_logs FOR ALL TO anon USING (false);
```

### Step 2.5 — Verify Tables in Supabase

In Supabase Dashboard → Table Editor, confirm three tables exist:
- `audits` — columns: id, audit_data, use_case, total_savings_monthly, created_at, public_slug
- `leads` — columns: id, email, company_name, role, team_size, audit_id, created_at, savings_per_month, high_value, notify_only
- `prompt_logs` — columns: id, audit_id, prompt, response, model_used, duration_ms, was_error, error_reason, created_at

### Step 2.6 — Commit

```bash
git add -A
git commit -m "feat: add database schema with Drizzle ORM and Supabase migrations"
git push origin main
```

---

## Phase 3 — Core Type System & Shared Infrastructure

**Goal:** All shared TypeScript types, the logger, rate limiter, and validators in place before any feature code.

### Step 3.1 — Audit Engine Types (`src/lib/audit/types.ts`)

```typescript
export type ToolId =
  | 'cursor'
  | 'github_copilot'
  | 'claude'
  | 'chatgpt'
  | 'anthropic_api'
  | 'openai_api'
  | 'gemini'
  | 'windsurf';

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
  toolName: string;
  plan: string;
  seats: number;
  currentMonthlySpend: number;
  status: AuditStatus;
  recommendedAction: string;
  savingsPerMonth: number;
  reason: string;
  alternativeTool?: string;
  alternativeMonthlySpend?: number;
}

export interface AuditSummary {
  results: AuditResult[];
  totalSavingsMonthly: number;
  totalSavingsAnnual: number;
  auditId: string;
  publicSlug: string;
  useCase: UseCase;
  teamSize: number;
}
```

### Step 3.2 — Zod Validators (`src/lib/validators/audit-input.ts`)

```typescript
import { z } from 'zod';

const TOOL_IDS = [
  'cursor', 'github_copilot', 'claude', 'chatgpt',
  'anthropic_api', 'openai_api', 'gemini', 'windsurf'
] as const;

const USE_CASES = ['coding', 'writing', 'data_analysis', 'research', 'mixed'] as const;

export const toolInputSchema = z.object({
  toolId: z.enum(TOOL_IDS),
  plan: z.string().min(1).max(50),
  seats: z.number().int().min(1).max(10000),
  monthlySpend: z.number().min(0).max(1000000),
});

export const auditInputSchema = z.object({
  tools: z.array(toolInputSchema).min(1).max(8),
  teamSize: z.number().int().min(1).max(100000),
  useCase: z.enum(USE_CASES),
  _honey: z.string().max(0).optional(), // honeypot — must be empty
});

export type AuditInputSchema = z.infer<typeof auditInputSchema>;
```

Create `src/lib/validators/lead-input.ts`:

```typescript
import { z } from 'zod';

export const leadInputSchema = z.object({
  auditId:     z.string().uuid(),
  email:       z.string().email().max(254),
  companyName: z.string().max(100).optional(),
  role:        z.string().max(100).optional(),
  teamSize:    z.number().int().min(1).max(100000).optional(),
  notifyOnly:  z.boolean().optional().default(false),
});
```

### Step 3.3 — Logger (`src/lib/logger.ts`)

```typescript
import pino from 'pino';

export const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: process.env.NODE_ENV !== 'production'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
  redact: ['email', 'companyName', 'body.email'], // Never log PII
});
```

### Step 3.4 — Rate Limiter (`src/lib/rate-limit/index.ts`)

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// 5 audit submissions per IP per hour
export const auditRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 h'),
  analytics: false,
  prefix: 'auditiq:audit:',
});

// 10 lead captures per IP per hour (less restrictive)
export const leadRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 h'),
  analytics: false,
  prefix: 'auditiq:lead:',
});

export async function checkAuditRateLimit(ip: string) {
  return auditRateLimit.limit(ip);
}

export async function checkLeadRateLimit(ip: string) {
  return leadRateLimit.limit(ip);
}
```

### Step 3.5 — Security Middleware (`src/middleware.ts`)

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options':           'nosniff',
  'X-Frame-Options':                  'DENY',
  'X-XSS-Protection':                 '1; mode=block',
  'Referrer-Policy':                  'strict-origin-when-cross-origin',
  'Permissions-Policy':               'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security':        'max-age=63072000; includeSubDomains; preload',
  'Content-Security-Policy':
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://plausible.io; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: blob: https:; " +
    "connect-src 'self' https://*.supabase.co https://plausible.io https://api.anthropic.com; " +
    "frame-ancestors 'none';",
};

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

### Step 3.6 — Shared API Types (`src/types/api.ts`)

```typescript
import type { AuditResult, AuditStatus, UseCase } from '@/lib/audit/types';

export interface AuditSubmitResponse {
  auditId: string;
  publicSlug: string;
  results: AuditResult[];
  totalSavingsMonthly: number;
  totalSavingsAnnual: number;
}

export interface AuditSummaryResponse {
  summary: string;
  wasFallback: boolean;
}

export interface LeadCaptureResponse {
  success: boolean;
}

export interface ApiError {
  error: string;
  details?: unknown;
}
```

### Step 3.7 — Commit

```bash
git add -A
git commit -m "feat: add core type system, Zod validators, logger, rate limiter, and security middleware"
git push origin main
```

---

## Phase 4 — Audit Engine (Deterministic Rules)

**Goal:** The heart of AuditIQ — pure TypeScript functions with no side effects that compute exact savings for each tool. Every dollar amount is traceable to `PRICING_DATA.md`.

### Step 4.1 — Pricing Constants (`src/lib/audit/pricing.ts`)

```typescript
// ALL prices in USD per month. Sources documented in PRICING_DATA.md.
// Verified: 2026-05-10

export const PRICING = {
  cursor: {
    hobby:      0,
    pro:        20,    // per user
    business:   40,    // per user
  },
  github_copilot: {
    individual: 10,    // flat, 1 user
    business:   19,    // per user/month
    enterprise: 39,    // per user/month
  },
  claude: {
    free:       0,
    pro:        20,    // per user
    max:        100,   // per user (5x usage limit)
    team:       30,    // per user (min 5 seats)
    enterprise: null,  // custom pricing
  },
  chatgpt: {
    plus:       20,    // per user
    team:       30,    // per user/month (min 2 seats)
    enterprise: null,  // custom pricing
  },
  gemini: {
    pro:        19.99, // per user
    ultra:      null,  // custom
  },
  windsurf: {
    free:       0,
    pro:        15,    // per user
    team:       35,    // per user
  },
} as const;
```

### Step 4.2 — Audit Engine Master Runner (`src/lib/audit/engine.ts`)

```typescript
import { customAlphabet } from 'nanoid';
import type { AuditInput, AuditResult, ToolInput } from './types';
import { auditCursor }        from './rules/cursor';
import { auditGithubCopilot } from './rules/github-copilot';
import { auditClaude }        from './rules/claude';
import { auditChatgpt }       from './rules/chatgpt';
import { auditAnthropicApi }  from './rules/anthropic-api';
import { auditOpenaiApi }     from './rules/openai-api';
import { auditGemini }        from './rules/gemini';
import { auditWindsurf }      from './rules/windsurf';

const TOOL_RUNNERS: Record<string, (tool: ToolInput, input: AuditInput) => AuditResult> = {
  cursor:        auditCursor,
  github_copilot: auditGithubCopilot,
  claude:        auditClaude,
  chatgpt:       auditChatgpt,
  anthropic_api: auditAnthropicApi,
  openai_api:    auditOpenaiApi,
  gemini:        auditGemini,
  windsurf:      auditWindsurf,
};

export function runAudit(input: AuditInput): AuditResult[] {
  return input.tools.map((tool) => {
    const runner = TOOL_RUNNERS[tool.toolId];
    if (!runner) throw new Error(`No audit rule for toolId: ${tool.toolId}`);
    return runner(tool, input);
  });
}

const nanoidAlphabet = customAlphabet(
  '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz',
  10
);
export function generatePublicSlug(): string {
  return nanoidAlphabet();
}
```

### Step 4.3 — Individual Tool Rules

Create one file per tool in `src/lib/audit/rules/`. Each file exports a single function that takes `(tool: ToolInput, input: AuditInput): AuditResult`.

**`src/lib/audit/rules/github-copilot.ts`** (full example, all other tools follow this pattern):

```typescript
import type { AuditInput, AuditResult, ToolInput } from '../types';
import { PRICING } from '../pricing';

export function auditGithubCopilot(tool: ToolInput, input: AuditInput): AuditResult {
  const { plan, seats, monthlySpend } = tool;
  const base: Pick<AuditResult, 'toolId' | 'toolName' | 'plan' | 'seats' | 'currentMonthlySpend'> = {
    toolId: 'github_copilot',
    toolName: 'GitHub Copilot',
    plan,
    seats,
    currentMonthlySpend: monthlySpend,
  };

  // Rule 1: Business plan, small team → downgrade to Individual
  if (plan === 'business' && seats <= 3 && ['coding', 'mixed'].includes(input.useCase)) {
    const individualCost = PRICING.github_copilot.individual;
    const currentCost    = PRICING.github_copilot.business * seats;
    const savings        = currentCost - individualCost;
    return {
      ...base,
      status: 'overspending',
      recommendedAction: `Downgrade to GitHub Copilot Individual ($${individualCost}/month flat). Business plan adds SSO and audit logs — unnecessary for teams under 5.`,
      savingsPerMonth: Math.max(0, savings),
      reason: `GitHub Copilot Individual covers 1 user at $${individualCost}/mo vs Business at $${PRICING.github_copilot.business}/user/mo. For ≤3 engineers, Individual is the cost-optimal choice.`,
    };
  }

  // Rule 2: Business plan, only 1 seat — Individual is sufficient
  if (plan === 'business' && seats === 1) {
    const savings = PRICING.github_copilot.business - PRICING.github_copilot.individual;
    return {
      ...base,
      status: 'overspending',
      recommendedAction: `Switch to GitHub Copilot Individual ($${PRICING.github_copilot.individual}/month). You're paying for a Business seat with no Business features in use.`,
      savingsPerMonth: savings,
      reason: `1 seat on Business plan costs $${PRICING.github_copilot.business}/mo vs Individual at $${PRICING.github_copilot.individual}/mo flat.`,
    };
  }

  // Rule 3: Enterprise, small team → downgrade to Business
  if (plan === 'enterprise' && seats <= 5) {
    const businessCost    = PRICING.github_copilot.business * seats;
    const enterpriseCost  = PRICING.github_copilot.enterprise * seats;
    const savings         = enterpriseCost - businessCost;
    return {
      ...base,
      status: 'overspending',
      recommendedAction: `Downgrade to GitHub Copilot Business ($${PRICING.github_copilot.business}/user/month). Enterprise features (SAML SSO, enterprise audit log) are unnecessary for teams under 10.`,
      savingsPerMonth: Math.max(0, savings),
      reason: `Enterprise at $${PRICING.github_copilot.enterprise}/user/mo vs Business at $${PRICING.github_copilot.business}/user/mo saves $${savings}/mo for ${seats} seats.`,
    };
  }

  // Rule 4: Writing/research use case → Copilot may not be best tool
  if (plan !== 'individual' && ['writing', 'research'].includes(input.useCase)) {
    return {
      ...base,
      status: 'switch_recommended',
      recommendedAction: `For ${input.useCase}, consider switching to Claude Pro ($20/user/month) or ChatGPT Plus ($20/user/month) which are better suited for non-coding tasks.`,
      savingsPerMonth: Math.max(0, monthlySpend - 20 * seats),
      reason: `GitHub Copilot is optimized for code completion. For ${input.useCase} workflows, LLM-native products provide better ROI.`,
      alternativeTool: 'claude',
      alternativeMonthlySpend: 20 * seats,
    };
  }

  // Already optimal
  return {
    ...base,
    status: 'optimal',
    recommendedAction: 'You are on the right plan for your team size and use case.',
    savingsPerMonth: 0,
    reason: 'Current plan is the most cost-effective option available for your team configuration.',
  };
}
```

**Create the following rule files** (each following the same pattern, applying the logic from `PRD.md §5.2`):

- `src/lib/audit/rules/cursor.ts` — Rules: Hobby is free (downgrade recommendation); Pro ($20/user) vs Business ($40/user) based on seats and whether enterprise features are needed; Windsurf as alternative for mixed/writing use cases.
- `src/lib/audit/rules/claude.ts` — Rules: Pro ($20) vs Max ($100) — flag Max for teams using standard features; Team ($30/user, min 5 seats) vs Pro ($20) for small teams; API direct vs subscription for heavy users.
- `src/lib/audit/rules/chatgpt.ts` — Rules: Plus ($20) vs Team ($30) for small vs larger teams; Enterprise flag for teams that could downgrade; API vs subscription assessment.
- `src/lib/audit/rules/anthropic-api.ts` — Rule: If `monthlySpend > 5000`, flag as "Review usage — set spend caps"; if spend could be replaced with Claude Pro subscription, calculate break-even.
- `src/lib/audit/rules/openai-api.ts` — Same pattern as `anthropic-api.ts`.
- `src/lib/audit/rules/gemini.ts` — Rules: Gemini Pro ($19.99) vs ChatGPT/Claude alternatives; API vs subscription.
- `src/lib/audit/rules/windsurf.ts` — Rules: Free tier available; Pro ($15/user) vs Team ($35/user) for small teams; Cursor Pro as alternative for coding use case.

> **Implementation note:** Each rule file must implement at minimum: right-plan-for-team-size check, cheaper-plan check, cheaper-alternative check, and a clean `optimal` fallback. Every threshold must be traceable to `PRICING_DATA.md`.

### Step 4.4 — Commit

```bash
git add -A
git commit -m "feat: implement deterministic audit engine with rules for all 8 AI tools"
git push origin main
```

---

## Phase 5 — API Routes (Backend)

**Goal:** All four API routes implemented, validated, and error-handled.

### Step 5.1 — POST `/api/audit/submit` (`src/app/api/audit/submit/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auditInputSchema } from '@/lib/validators/audit-input';
import { runAudit, generatePublicSlug } from '@/lib/audit/engine';
import { db } from '@/lib/db/client';
import { audits } from '@/lib/db/schema';
import { checkAuditRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  // 1. Rate limit
  const { success: rateLimitOk } = await checkAuditRateLimit(ip);
  if (!rateLimitOk) {
    return NextResponse.json({ error: 'Too many requests. Try again in an hour.' }, { status: 429 });
  }

  // 2. Parse body
  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 }); }

  // 3. Validate (includes honeypot check)
  const parsed = auditInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.issues }, { status: 400 });
  }

  // 4. Check honeypot
  if (parsed.data._honey) {
    // Bot detected — return fake success silently
    return NextResponse.json({ auditId: 'fake', publicSlug: 'fake', results: [], totalSavingsMonthly: 0, totalSavingsAnnual: 0 });
  }

  const input = parsed.data;

  // 5. Run audit engine (pure, synchronous, no side effects)
  const results = runAudit(input);
  const totalSavingsMonthly = results.reduce((s, r) => s + r.savingsPerMonth, 0);
  const totalSavingsAnnual  = totalSavingsMonthly * 12;
  const publicSlug = generatePublicSlug();

  // 6. Persist to Supabase
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
    logger.error({ err }, 'DB insert failed');
    return NextResponse.json({ error: 'Failed to save audit. Please try again.' }, { status: 500 });
  }
}
```

### Step 5.2 — GET `/api/audit/summary` (`src/app/api/audit/summary/route.ts`)

First, create the AI summary module (`src/lib/ai/summary.ts`):

```typescript
import Anthropic from '@anthropic-ai/sdk';
import type { AuditResult, UseCase } from '@/lib/audit/types';
import { logger } from '@/lib/logger';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

interface SummaryInput {
  results: AuditResult[];
  totalSavingsMonthly: number;
  useCase: UseCase;
  teamSize: number;
}

function buildPrompt(input: SummaryInput): string {
  const toolSummary = input.results.map(r =>
    `- ${r.toolName} (${r.plan}, ${r.seats} seat${r.seats !== 1 ? 's' : ''}): ` +
    `${r.status === 'optimal' ? 'optimal' : `save $${r.savingsPerMonth}/mo — ${r.recommendedAction}`}`
  ).join('\n');

  return `You are a financial analyst specializing in SaaS tool optimization for startups.

A startup with ${input.teamSize} engineers using AI tools primarily for ${input.useCase} submitted an AI spend audit. Here are the findings:

${toolSummary}

Total potential savings: $${input.totalSavingsMonthly}/month ($${input.totalSavingsMonthly * 12}/year).

Write exactly one paragraph (approximately 100 words) in plain English summarizing:
1. Their current spending situation
2. The most impactful change they should make
3. A specific, actionable next step

Do not include dollar amounts already shown in the UI. Do not include any PII. Write directly to the user ("your team", "you"). Be specific, not generic.`;
}

function buildFallback(input: SummaryInput): string {
  const topSaving = input.results
    .filter(r => r.savingsPerMonth > 0)
    .sort((a, b) => b.savingsPerMonth - a.savingsPerMonth)[0];

  if (!topSaving) {
    return `Your team's AI tool spend looks well-optimized for your current stack. You're on the right plans for your team size and use case. As your team grows or your workflows shift, it's worth re-running this audit — pricing changes and new tools can shift the optimal configuration. For now, you're spending efficiently.`;
  }

  return `Based on your current ${input.useCase} workflow with ${input.teamSize} engineers, your most impactful move is ${topSaving.recommendedAction.toLowerCase()} The rest of your stack is reasonably configured. Small plan optimizations across your tools compound quickly — the changes identified here could free up meaningful budget every month. We recommend starting with ${topSaving.toolName} and reassessing in 30 days.`;
}

export async function generateSummary(input: SummaryInput, auditId: string): Promise<{ summary: string; wasFallback: boolean }> {
  const prompt = buildPrompt(input);
  const startTime = Date.now();

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content
      .filter(b => b.type === 'text')
      .map(b => b.type === 'text' ? b.text : '')
      .join('');

    logger.info({ auditId, durationMs: Date.now() - startTime }, 'AI summary generated');
    return { summary: text.trim(), wasFallback: false };

  } catch (err) {
    logger.error({ err, auditId }, 'Anthropic API call failed — using fallback');
    return { summary: buildFallback(input), wasFallback: true };
  }
}
```

Now create the route:

```typescript
// src/app/api/audit/summary/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { audits, promptLogs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateSummary } from '@/lib/ai/summary';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const auditId = req.nextUrl.searchParams.get('auditId');

  if (!auditId || !/^[0-9a-f-]{36}$/.test(auditId)) {
    return NextResponse.json({ error: 'Missing or invalid auditId.' }, { status: 400 });
  }

  const audit = await db.query.audits.findFirst({ where: eq(audits.id, auditId) });
  if (!audit) return NextResponse.json({ error: 'Audit not found.' }, { status: 404 });

  const data = audit.auditData as { results: any[]; input: any };
  const { summary, wasFallback } = await generateSummary({
    results:              data.results,
    totalSavingsMonthly:  Number(audit.totalSavingsMonthly),
    useCase:              audit.useCase as any,
    teamSize:             data.input?.teamSize ?? 1,
  }, auditId);

  return NextResponse.json({ summary, wasFallback });
}
```

### Step 5.3 — Email Template (`src/lib/email/templates/AuditConfirmation.tsx`)

```typescript
import {
  Html, Head, Body, Container, Heading,
  Text, Section, Hr, Link
} from '@react-email/components';

interface AuditConfirmationProps {
  totalSavingsMonthly: number;
  topRecommendations: string[];
  shareUrl: string;
  isHighValue: boolean;
}

export default function AuditConfirmation({
  totalSavingsMonthly,
  topRecommendations,
  shareUrl,
  isHighValue,
}: AuditConfirmationProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#080C14', fontFamily: 'Inter, sans-serif', color: '#E2E8F0' }}>
        <Container style={{ maxWidth: '560px', margin: '40px auto', padding: '32px' }}>
          <Heading style={{ color: '#00FF87', fontSize: '28px', marginBottom: '8px' }}>
            Your AI Spend Audit
          </Heading>
          <Text style={{ fontSize: '18px', color: '#E2E8F0' }}>
            We found <strong style={{ color: '#00FF87' }}>${totalSavingsMonthly.toLocaleString()}/month</strong> in potential savings.
          </Text>
          <Hr style={{ borderColor: '#1C2540', margin: '24px 0' }} />
          <Heading as="h2" style={{ fontSize: '16px', color: '#94A3B8', marginBottom: '12px' }}>
            Top Recommendations
          </Heading>
          {topRecommendations.map((rec, i) => (
            <Text key={i} style={{ fontSize: '14px', color: '#CBD5E1', margin: '8px 0' }}>
              {i + 1}. {rec}
            </Text>
          ))}
          <Hr style={{ borderColor: '#1C2540', margin: '24px 0' }} />
          {isHighValue && (
            <Section style={{ background: 'rgba(0,255,135,0.08)', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
              <Text style={{ color: '#00FF87', fontWeight: 'bold', margin: '0 0 8px' }}>
                You qualify for a free Credex consultation
              </Text>
              <Text style={{ color: '#CBD5E1', fontSize: '14px', margin: 0 }}>
                Our team can help you capture these savings through discounted AI credits.{' '}
                <Link href="https://credex.rocks" style={{ color: '#4D9EFF' }}>Book a call →</Link>
              </Text>
            </Section>
          )}
          <Link href={shareUrl} style={{ color: '#4D9EFF', fontSize: '14px' }}>
            View your full audit →
          </Link>
        </Container>
      </Body>
    </Html>
  );
}
```

### Step 5.4 — Email Client (`src/lib/email/client.ts`)

```typescript
import { Resend } from 'resend';
import AuditConfirmation from './templates/AuditConfirmation';

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'audit@onboarding.resend.dev';

export async function sendAuditConfirmation(params: {
  to: string;
  totalSavingsMonthly: number;
  topRecommendations: string[];
  shareUrl: string;
  isHighValue: boolean;
}) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: `Your AI spend audit: $${params.totalSavingsMonthly.toLocaleString()}/mo in savings found`,
    react: AuditConfirmation({
      totalSavingsMonthly:  params.totalSavingsMonthly,
      topRecommendations:   params.topRecommendations,
      shareUrl:             params.shareUrl,
      isHighValue:          params.isHighValue,
    }),
  });
}
```

### Step 5.5 — POST `/api/leads/capture` (`src/app/api/leads/capture/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { leadInputSchema } from '@/lib/validators/lead-input';
import { db } from '@/lib/db/client';
import { leads, audits } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { sendAuditConfirmation } from '@/lib/email/client';
import { checkLeadRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const { success: rateLimitOk } = await checkLeadRateLimit(ip);
  if (!rateLimitOk) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  }

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 }); }

  const parsed = leadInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.issues }, { status: 400 });
  }

  const { auditId, email, companyName, role, teamSize, notifyOnly } = parsed.data;

  // Verify audit exists
  const audit = await db.query.audits.findFirst({ where: eq(audits.id, auditId) });
  if (!audit) return NextResponse.json({ error: 'Audit not found.' }, { status: 404 });

  // Idempotency check
  const existing = await db.query.leads.findFirst({
    where: and(eq(leads.auditId, auditId), eq(leads.email, email))
  });
  if (existing) return NextResponse.json({ success: true });

  const totalSavings = Number(audit.totalSavingsMonthly);
  const isHighValue  = totalSavings > 500;

  try {
    await db.insert(leads).values({
      email,
      companyName:    companyName ?? null,
      role:           role ?? null,
      teamSize:       teamSize ?? null,
      auditId,
      savingsPerMonth: String(totalSavings),
      highValue:      isHighValue,
      notifyOnly:     notifyOnly ?? false,
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
    const data = audit.auditData as { results: any[] };
    const topRecs = data.results
      .filter(r => r.savingsPerMonth > 0)
      .sort((a, b) => b.savingsPerMonth - a.savingsPerMonth)
      .slice(0, 3)
      .map(r => r.recommendedAction);

    await sendAuditConfirmation({
      to:                   email,
      totalSavingsMonthly:  totalSavings,
      topRecommendations:   topRecs,
      shareUrl:             `${appUrl}/share/${audit.publicSlug}`,
      isHighValue,
    });

    logger.info({ auditId }, 'Lead captured');
    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error({ err, auditId }, 'Lead capture failed');
    return NextResponse.json({ error: 'Failed to save. Try again.' }, { status: 500 });
  }
}
```

### Step 5.6 — Commit

```bash
git add -A
git commit -m "feat: implement all API routes — audit submit, AI summary, lead capture"
git push origin main
```

---

## Phase 6 — Frontend: Design System & Global Layout

**Goal:** The root layout, navigation, footer, and global design tokens wired into every page.

### Step 6.1 — Font Setup (`src/app/layout.tsx`)

```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'AuditIQ — AI Spend Audit',
  description: 'Find exactly where your team is wasting money on AI tools. Free, instant, no account needed.',
  openGraph: {
    title: 'AuditIQ — AI Spend Audit',
    description: 'Free AI spend audit — see what your team could save.',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} bg-void text-slate-200 antialiased`}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
```

### Step 6.2 — Navigation Component (`src/components/layout/Navbar.tsx`)

```typescript
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const isAuditPage = pathname === '/audit';

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
      scrolled ? 'bg-abyss/90 backdrop-blur-glass border-b border-white/5 shadow-lg' : 'bg-transparent'
    }`}>
      <nav className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-white tracking-tight hover:text-neon-green transition-colors">
          Audit<span className="text-neon-green">IQ</span>
        </Link>
        {!isAuditPage && (
          <Button asChild variant="outline" size="sm"
            className="border-white/20 text-white hover:bg-white/10 hover:text-neon-green">
            <Link href="/audit">Run Your Own Audit →</Link>
          </Button>
        )}
      </nav>
    </header>
  );
}
```

### Step 6.3 — Footer Component (`src/components/layout/Footer.tsx`)

```typescript
export function Footer() {
  return (
    <footer className="border-t border-white/5 mt-24 py-8">
      <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
        <span>Built for <a href="https://credex.rocks" className="text-neon-green hover:underline">Credex</a></span>
        <div className="flex gap-6">
          <button className="hover:text-white transition-colors">Privacy</button>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
        </div>
      </div>
    </footer>
  );
}
```

### Step 6.4 — 3D Background Canvas Component (`src/components/three/BackgroundCanvas.tsx`)

```typescript
'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

function RotatingIcosahedron() {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (mesh.current) {
      mesh.current.rotation.x += delta * 0.1;
      mesh.current.rotation.y += delta * 0.15;
    }
  });
  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[2, 1]} />
      <meshBasicMaterial color="#00FF87" wireframe opacity={0.15} transparent />
    </mesh>
  );
}

export function BackgroundCanvas({ variant = 'landing' }: { variant?: 'landing' | 'audit' | 'results' }) {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.5} />
        {variant === 'landing' && <RotatingIcosahedron />}
        {/* Add audit and results variants here */}
      </Canvas>
    </div>
  );
}
```

> **Note:** Install Three.js ecosystem packages if not included above:
> ```bash
> npm install @react-three/fiber@8.x @react-three/drei@9.x three@0.162.x
> npm install --save-dev @types/three
> ```

### Step 6.5 — Commit

```bash
git add -A
git commit -m "feat: add global layout, navbar, footer, and 3D background canvas"
git push origin main
```

---

## Phase 7 — Landing Page (`/`)

**Goal:** A conversion-optimized landing page that matches the "Fintech Control Room" aesthetic. This page gets screenshotted and shared — it must look like a real SaaS product.

### Step 7.1 — Landing Page Structure (`src/app/page.tsx`)

```typescript
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/landing/HeroSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { ToolsGridSection } from '@/components/landing/ToolsGridSection';
import { SampleAuditSection } from '@/components/landing/SampleAuditSection';
import { FAQSection } from '@/components/landing/FAQSection';

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <HeroSection />
        <HowItWorksSection />
        <ToolsGridSection />
        <SampleAuditSection />
        <FAQSection />
      </main>
      <Footer />
    </>
  );
}
```

### Step 7.2 — Hero Section (`src/components/landing/HeroSection.tsx`)

```typescript
'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BackgroundCanvas } from '@/components/three/BackgroundCanvas';

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center px-4">
      <BackgroundCanvas variant="landing" />
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}>
          <p className="text-neon-green text-sm font-mono uppercase tracking-widest mb-4">
            Free · Instant · No account needed
          </p>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-none mb-6 tracking-tight">
            Find out where your{' '}
            <span className="text-neon-green drop-shadow-[0_0_30px_rgba(0,255,135,0.5)]">
              AI bills
            </span>{' '}
            are bleeding money.
          </h1>
          <p className="text-xl text-slate-300 mb-10 max-w-xl mx-auto">
            Enter your team's AI subscriptions. Get an instant itemized breakdown
            of overspend and exactly what to change.
          </p>
          <Button asChild size="lg"
            className="bg-neon-green text-void font-bold text-lg px-8 py-4 h-auto hover:bg-neon-green/90 shadow-savings">
            <Link href="/audit">Audit my AI spend — it's free →</Link>
          </Button>
          <p className="text-slate-500 text-sm mt-4">
            Used by 200+ engineering teams this week
          </p>
        </motion.div>
      </div>
    </section>
  );
}
```

### Step 7.3 — How It Works, Tools Grid, Sample Audit, and FAQ

Create the following components in `src/components/landing/`:

**`HowItWorksSection.tsx`** — Three-step horizontal (desktop) / vertical (mobile) layout with icons, using Framer Motion `staggerChildren`. Steps: "Enter your AI tools" → "Get your instant audit" → "See where to save."

**`ToolsGridSection.tsx`** — Logo grid of all 8 supported tools. Display each tool name with a placeholder icon (use a colored square with tool initial for MVP, replace with real SVG logos). Subtext: "Pricing verified weekly against official vendor pages."

**`SampleAuditSection.tsx`** — Static mockup of a result card showing example data. Must be labeled "Example output — not real data." Use the same `glass-card` CSS class and status badge components to give an authentic preview.

**`FAQSection.tsx`** — Use shadcn/ui `Accordion` with 5 FAQ items from `LANDING_COPY.md`. Questions: Is this free? How do you know the right plan? Is my data private? How often is pricing updated? What is Credex?

### Step 7.4 — Commit

```bash
git add -A
git commit -m "feat: build landing page with hero, how-it-works, tools grid, sample audit, and FAQ"
git push origin main
```

---

## Phase 8 — Spend Input Form (`/audit`)

**Goal:** The primary conversion surface. Must persist state to localStorage, show a running total, validate inputs, and submit to the API.

### Step 8.1 — Zustand Store (`src/store/auditFormStore.ts`)

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ToolId, UseCase } from '@/lib/audit/types';

export interface ToolRow {
  id: string;          // local UUID for list key
  toolId: ToolId | '';
  plan: string;
  seats: number;
  monthlySpend: number;
}

interface AuditFormStore {
  tools:       ToolRow[];
  teamSize:    number;
  useCase:     UseCase | '';
  addTool:     () => void;
  removeTool:  (id: string) => void;
  updateTool:  (id: string, patch: Partial<ToolRow>) => void;
  setTeamSize: (n: number) => void;
  setUseCase:  (u: UseCase) => void;
  clearForm:   () => void;
}

const emptyTool = (): ToolRow => ({
  id: crypto.randomUUID(),
  toolId: '', plan: '', seats: 1, monthlySpend: 0,
});

export const useAuditFormStore = create<AuditFormStore>()(
  persist(
    (set) => ({
      tools:    [emptyTool()],
      teamSize: 0,
      useCase:  '',
      addTool:  () => set(s => ({ tools: [...s.tools, emptyTool()] })),
      removeTool: (id) => set(s => ({ tools: s.tools.filter(t => t.id !== id) })),
      updateTool: (id, patch) => set(s => ({
        tools: s.tools.map(t => t.id === id ? { ...t, ...patch } : t),
      })),
      setTeamSize: (teamSize) => set({ teamSize }),
      setUseCase: (useCase) => set({ useCase }),
      clearForm: () => set({ tools: [emptyTool()], teamSize: 0, useCase: '' }),
    }),
    { name: 'aisaa_form_state' }
  )
);
```

### Step 8.2 — Audit Form Page (`src/app/audit/page.tsx`)

```typescript
import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { AuditForm } from '@/components/audit/AuditForm';

export const metadata: Metadata = {
  title: 'AuditIQ — Run Your Audit',
  description: 'Enter your AI tool subscriptions and get an instant spend audit.',
};

export default function AuditPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Audit Your AI Spend</h1>
          <p className="text-slate-400 mb-8">
            Enter every AI tool your team pays for. We'll tell you exactly where you're overspending.
          </p>
          <AuditForm />
        </div>
      </main>
    </>
  );
}
```

### Step 8.3 — AuditForm Component (`src/components/audit/AuditForm.tsx`)

Create this as a `'use client'` component. Key elements:

1. **ToolRow component** — One row per tool: `Select` for tool name, `Select` for plan (dynamically populated based on tool), `Input` for seats, `Input` for monthly spend (USD), trash icon button to remove.

2. **"+ Add tool" button** — Calls `addTool()` from store. Disabled when 8 tools already added or the same toolId is already in the list.

3. **Team size input** — Number input, min 1.

4. **Use case segmented control** — 5 options: Coding / Writing / Data Analysis / Research / Mixed. Keyboard navigable (arrow keys).

5. **Running total sidebar/bar** — Shows `$X,XXX / month` and `$XX,XXX / year`, updates on every change.

6. **Honeypot field** — `<input name="_honey" className="hidden" aria-hidden="true" tabIndex={-1} />` — included in form submission but hidden from users.

7. **Submit handler** — Validates locally (min 1 tool, team size ≥ 1, use case selected), calls `POST /api/audit/submit`, stores `auditId` in sessionStorage, redirects to `/results/[auditId]`.

8. **Error handling** — Toast for 429 (rate limit), Toast for 500 (server error), inline validation messages for empty required fields.

### Step 8.4 — Tool Configuration Data (`src/lib/audit/tool-config.ts`)

```typescript
export const TOOL_CONFIG = {
  cursor: {
    name: 'Cursor',
    plans: ['hobby', 'pro', 'business', 'enterprise'],
    perSeat: true,
  },
  github_copilot: {
    name: 'GitHub Copilot',
    plans: ['individual', 'business', 'enterprise'],
    perSeat: true,
  },
  claude: {
    name: 'Claude (Anthropic)',
    plans: ['free', 'pro', 'max', 'team', 'enterprise'],
    perSeat: true,
  },
  chatgpt: {
    name: 'ChatGPT (OpenAI)',
    plans: ['plus', 'team', 'enterprise', 'api_direct'],
    perSeat: true,
  },
  anthropic_api: {
    name: 'Anthropic API (Direct)',
    plans: ['usage_based'],
    perSeat: false, // free-form monthly spend
  },
  openai_api: {
    name: 'OpenAI API (Direct)',
    plans: ['usage_based'],
    perSeat: false,
  },
  gemini: {
    name: 'Gemini (Google)',
    plans: ['free', 'pro', 'ultra', 'api'],
    perSeat: true,
  },
  windsurf: {
    name: 'Windsurf',
    plans: ['free', 'pro', 'team'],
    perSeat: true,
  },
} as const;
```

### Step 8.5 — Commit

```bash
git add -A
git commit -m "feat: build spend input form with Zustand persistence, running total, and API submission"
git push origin main
```

---

## Phase 9 — Audit Results Page (`/results/[auditId]`)

**Goal:** The "wow moment." Hero savings number, per-tool cards, AI summary, Credex CTA, email capture, and share button — all in one polished, shareable page.

### Step 9.1 — Results Page (`src/app/results/[auditId]/page.tsx`)

```typescript
import { notFound } from 'next/navigation';
import { db } from '@/lib/db/client';
import { audits } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroSavingsBlock } from '@/components/results/HeroSavingsBlock';
import { ToolResultCards } from '@/components/results/ToolResultCards';
import { AISummaryBlock } from '@/components/results/AISummaryBlock';
import { CredexCTABlock } from '@/components/results/CredexCTABlock';
import { EmailCaptureForm } from '@/components/results/EmailCaptureForm';
import { ShareBlock } from '@/components/results/ShareBlock';
import type { AuditResult } from '@/lib/audit/types';

interface Props {
  params: { auditId: string };
}

export default async function ResultsPage({ params }: Props) {
  const audit = await db.query.audits.findFirst({
    where: eq(audits.id, params.auditId),
  });

  if (!audit) notFound();

  const data = audit.auditData as { results: AuditResult[]; input: any };
  const totalSavingsMonthly = Number(audit.totalSavingsMonthly);
  const totalSavingsAnnual  = totalSavingsMonthly * 12;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
  const shareUrl = `${appUrl}/share/${audit.publicSlug}`;

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          <HeroSavingsBlock
            totalSavingsMonthly={totalSavingsMonthly}
            totalSavingsAnnual={totalSavingsAnnual}
          />
          <ToolResultCards results={data.results} />
          <AISummaryBlock auditId={params.auditId} />
          <CredexCTABlock totalSavingsMonthly={totalSavingsMonthly} />
          <EmailCaptureForm
            auditId={params.auditId}
            totalSavingsMonthly={totalSavingsMonthly}
          />
          <ShareBlock shareUrl={shareUrl} />
        </div>
      </main>
      <Footer />
    </>
  );
}
```

### Step 9.2 — Hero Savings Block (`src/components/results/HeroSavingsBlock.tsx`)

```typescript
'use client';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';

function CountUpNumber({ target, prefix = '$', suffix = '' }: { target: number; prefix?: string; suffix?: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, v => `${prefix}${Math.round(v).toLocaleString()}${suffix}`);

  useEffect(() => {
    const controls = animate(count, target, { duration: 1.2, ease: 'easeOut' });
    return controls.stop;
  }, [target, count]);

  return <motion.span>{rounded}</motion.span>;
}

export function HeroSavingsBlock({ totalSavingsMonthly, totalSavingsAnnual }: {
  totalSavingsMonthly: number;
  totalSavingsAnnual: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-8 md:p-12 text-center">
      <p className="text-slate-400 text-sm uppercase tracking-widest mb-3 font-mono">
        Potential Monthly Savings
      </p>
      <div className="savings-number">
        {totalSavingsMonthly > 0
          ? <CountUpNumber target={totalSavingsMonthly} prefix="$" suffix="/mo" />
          : <span className="text-slate-400 text-4xl">$0/mo</span>
        }
      </div>
      {totalSavingsAnnual > 0 && (
        <p className="text-2xl text-slate-300 font-semibold mt-2">
          <CountUpNumber target={totalSavingsAnnual} prefix="$" suffix=" annually" />
        </p>
      )}
      {totalSavingsMonthly === 0 && (
        <p className="text-slate-300 mt-4 text-lg">
          Your AI spend looks optimized. You're on the right plans for your team.
        </p>
      )}
    </motion.div>
  );
}
```

### Step 9.3 — Tool Result Cards (`src/components/results/ToolResultCards.tsx`)

```typescript
'use client';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import type { AuditResult } from '@/lib/audit/types';

const STATUS_CONFIG = {
  optimal:            { color: 'bg-neon-green/10 text-neon-green border-neon-green/20',  icon: '✓', label: 'Optimal' },
  overspending:       { color: 'bg-neon-amber/10 text-neon-amber border-neon-amber/20',  icon: '⚠', label: 'Overspending' },
  switch_recommended: { color: 'bg-neon-red/10 text-neon-red border-neon-red/20',        icon: '→', label: 'Switch Recommended' },
} as const;

function ToolCard({ result, index }: { result: AuditResult; index: number }) {
  const config = STATUS_CONFIG[result.status];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="glass-card p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-white font-semibold text-lg">{result.toolName}</h3>
          <p className="text-slate-400 text-sm">{result.plan} · {result.seats} seat{result.seats !== 1 ? 's' : ''}</p>
        </div>
        <Badge className={`${config.color} border shrink-0`}>
          {config.icon} {config.label}
        </Badge>
      </div>
      <div className="flex flex-wrap gap-6 mb-4 text-sm">
        <div>
          <p className="text-slate-500 uppercase tracking-wide text-xs mb-1">Current Spend</p>
          <p className="text-white font-mono">${result.currentMonthlySpend.toLocaleString()}/mo</p>
        </div>
        {result.savingsPerMonth > 0 && (
          <div>
            <p className="text-slate-500 uppercase tracking-wide text-xs mb-1">Potential Saving</p>
            <p className="text-neon-green font-mono font-bold">${result.savingsPerMonth.toLocaleString()}/mo</p>
          </div>
        )}
      </div>
      {result.status !== 'optimal' && (
        <>
          <p className="text-slate-300 text-sm mb-2">{result.recommendedAction}</p>
          <p className="text-slate-500 text-xs italic">{result.reason}</p>
        </>
      )}
    </motion.div>
  );
}

export function ToolResultCards({ results }: { results: AuditResult[] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-white font-semibold text-xl">Per-Tool Breakdown</h2>
      {results.map((r, i) => <ToolCard key={r.toolId} result={r} index={i} />)}
    </div>
  );
}
```

### Step 9.4 — AI Summary Block (`src/components/results/AISummaryBlock.tsx`)

```typescript
'use client';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function AISummaryBlock({ auditId }: { auditId: string }) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/audit/summary?auditId=${auditId}`)
      .then(r => r.json())
      .then(d => setSummary(d.summary))
      .catch(() => setSummary('Unable to load summary.'))
      .finally(() => setLoading(false));
  }, [auditId]);

  return (
    <div className="glass-card p-6">
      <h2 className="text-white font-semibold text-lg mb-4">Your Personalized Summary</h2>
      {loading ? (
        <div className="space-y-3" aria-busy="true" aria-label="Loading summary...">
          <Skeleton className="h-4 w-full shimmer-bar" />
          <Skeleton className="h-4 w-11/12 shimmer-bar" />
          <Skeleton className="h-4 w-3/4 shimmer-bar" />
        </div>
      ) : (
        <p className="text-slate-300 leading-relaxed prose-sm">{summary}</p>
      )}
    </div>
  );
}
```

### Step 9.5 — Credex CTA Block (`src/components/results/CredexCTABlock.tsx`)

```typescript
'use client';
import { Button } from '@/components/ui/button';

export function CredexCTABlock({ totalSavingsMonthly }: { totalSavingsMonthly: number }) {
  if (totalSavingsMonthly > 500) {
    return (
      <div className="glass-card p-6 border border-neon-green/20 bg-neon-green/5">
        <h2 className="text-neon-green font-bold text-xl mb-2">
          You qualify for a Credex consultation
        </h2>
        <p className="text-slate-300 mb-4">
          Your team could save over ${totalSavingsMonthly.toLocaleString()}/month.
          Credex sells discounted AI credits that can capture a significant portion of these savings.
          Book a free 20-minute call with our team.
        </p>
        <Button asChild className="bg-neon-green text-void font-bold hover:bg-neon-green/90">
          <a href="https://credex.rocks" target="_blank" rel="noopener noreferrer">
            Book a free consultation →
          </a>
        </Button>
      </div>
    );
  }

  if (totalSavingsMonthly > 0) {
    return (
      <div className="glass-card p-6 border border-neon-blue/20 bg-neon-blue/5">
        <h2 className="text-neon-blue font-semibold text-lg mb-2">Want to capture these savings?</h2>
        <p className="text-slate-300 mb-4 text-sm">
          Credex provides discounted AI credits for tools like Anthropic and OpenAI.
          It may be worth exploring if your team uses API-based tools.
        </p>
        <a href="https://credex.rocks" className="text-neon-blue hover:underline text-sm" target="_blank" rel="noopener noreferrer">
          Learn about Credex →
        </a>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 border border-slate-700">
      <h2 className="text-white font-semibold text-lg mb-2">You're spending well 🎯</h2>
      <p className="text-slate-400 text-sm">
        Your current AI tool stack looks optimized. We'll notify you when pricing changes or new
        alternatives emerge that could improve your setup.
      </p>
    </div>
  );
}
```

### Step 9.6 — Email Capture Form (`src/components/results/EmailCaptureForm.tsx`)

```typescript
'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const schema = z.object({ email: z.string().email(), companyName: z.string().optional() });

export function EmailCaptureForm({ auditId, totalSavingsMonthly }: { auditId: string; totalSavingsMonthly: number }) {
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const ctaCopy = totalSavingsMonthly > 500
    ? 'Get your full report + Credex consultation details'
    : totalSavingsMonthly > 0
    ? 'Get your full audit report by email'
    : 'Notify me when new optimizations apply to my stack';

  const onSubmit = async (data: z.infer<typeof schema>) => {
    const res = await fetch('/api/leads/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auditId, email: data.email, companyName: data.companyName, notifyOnly: totalSavingsMonthly === 0 }),
    });
    if (res.ok) {
      setSubmitted(true);
      toast.success('Report on its way to your inbox.');
    } else {
      toast.error('Something went wrong. Please try again.');
    }
  };

  if (submitted) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-neon-green font-semibold text-lg">✓ Check your inbox</p>
        <p className="text-slate-400 text-sm mt-1">Your audit report is on its way.</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h2 className="text-white font-semibold text-lg mb-1">{ctaCopy}</h2>
      <p className="text-slate-400 text-sm mb-4">No spam. One email. Unsubscribe anytime.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <label htmlFor="email" className="text-slate-300 text-sm mb-1 block">Email address *</label>
          <Input id="email" type="email" placeholder="you@company.com"
            className="bg-surface border-white/10 text-white" {...register('email')} />
          {errors.email && <p className="text-neon-red text-xs mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="company" className="text-slate-300 text-sm mb-1 block">Company name (optional)</label>
          <Input id="company" type="text" placeholder="Acme Corp"
            className="bg-surface border-white/10 text-white" {...register('companyName')} />
        </div>
        <Button type="submit" disabled={isSubmitting}
          className="w-full bg-neon-green text-void font-bold hover:bg-neon-green/90">
          {isSubmitting ? 'Sending...' : 'Get my report →'}
        </Button>
      </form>
    </div>
  );
}
```

### Step 9.7 — Share Block (`src/components/results/ShareBlock.tsx`)

```typescript
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function ShareBlock({ shareUrl }: { shareUrl: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.info('Link copied to clipboard.');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy. Please copy the link manually.');
    }
  };

  return (
    <div className="glass-card p-6">
      <h2 className="text-white font-semibold text-lg mb-2">Share your audit</h2>
      <p className="text-slate-400 text-sm mb-4">
        This link shows your results without any personal information.
      </p>
      <div className="flex gap-3">
        <Input value={shareUrl} readOnly className="bg-surface border-white/10 text-slate-300 font-mono text-sm" />
        <Button onClick={handleCopy} aria-label="Copy share link to clipboard"
          className="shrink-0 bg-surface border border-white/10 hover:bg-overlay text-white">
          {copied ? '✓ Copied!' : 'Copy link'}
        </Button>
      </div>
    </div>
  );
}
```

### Step 9.8 — `not-found.tsx` for Results (`src/app/results/[auditId]/not-found.tsx`)

```typescript
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Audit not found</h1>
        <p className="text-slate-400 mb-6">It may have expired or the link is incorrect.</p>
        <Button asChild className="bg-neon-green text-void font-bold">
          <Link href="/audit">Run a new audit →</Link>
        </Button>
      </div>
    </div>
  );
}
```

### Step 9.9 — Commit

```bash
git add -A
git commit -m "feat: build audit results page with hero savings, tool cards, AI summary, CTA, email capture, and share block"
git push origin main
```

---

## Phase 10 — Share Page (`/share/[auditId]`)

**Goal:** Public-facing, anonymized view of an audit result. Drives social sharing and viral loops. Must have proper OG meta tags for Twitter/LinkedIn previews.

### Step 10.1 — Share Page (`src/app/share/[auditId]/page.tsx`)

```typescript
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { db } from '@/lib/db/client';
import { audits } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroSavingsBlock } from '@/components/results/HeroSavingsBlock';
import { ToolResultCards } from '@/components/results/ToolResultCards';
import type { AuditResult } from '@/lib/audit/types';

interface Props { params: { auditId: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const audit = await db.query.audits.findFirst({ where: eq(audits.id, params.auditId) });
  if (!audit) return {};

  const savings = Number(audit.totalSavingsMonthly);
  const appUrl  = process.env.NEXT_PUBLIC_APP_URL ?? '';
  const ogTitle = savings > 0
    ? `I found $${(savings * 12).toLocaleString()}/yr in AI tool savings`
    : 'My AI tool stack is spending-optimized';

  return {
    title: `${ogTitle} — AuditIQ`,
    description: 'Free AI spend audit — see what your team could save on AI tools.',
    openGraph: {
      title: ogTitle,
      description: 'Free AI spend audit — see what your team could save.',
      images: [`${appUrl}/api/og?auditId=${params.auditId}`],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      images: [`${appUrl}/api/og?auditId=${params.auditId}`],
    },
  };
}

export default async function SharePage({ params }: Props) {
  const audit = await db.query.audits.findFirst({ where: eq(audits.id, params.auditId) });
  if (!audit) notFound();

  const data = audit.auditData as { results: AuditResult[] };
  const totalSavingsMonthly = Number(audit.totalSavingsMonthly);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';

  return (
    <>
      <Navbar />
      <div className="bg-depth/60 border-b border-white/5 py-3 px-4">
        <p className="text-center text-slate-400 text-sm">
          You're viewing a shared AI spend audit. No personal information is shown.{' '}
          <a href="/audit" className="text-neon-green hover:underline">Run your own audit →</a>
        </p>
      </div>
      <main className="pt-8 pb-16 px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          <HeroSavingsBlock
            totalSavingsMonthly={totalSavingsMonthly}
            totalSavingsAnnual={totalSavingsMonthly * 12}
          />
          <ToolResultCards results={data.results} />
          <div className="glass-card p-6 text-center">
            <p className="text-white font-semibold mb-2">Curious about your own AI spend?</p>
            <a href={`${appUrl}/audit`}
              className="inline-block bg-neon-green text-void font-bold px-6 py-3 rounded-lg hover:bg-neon-green/90 transition-colors">
              Get your free audit →
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
```

### Step 10.2 — Commit

```bash
git add -A
git commit -m "feat: build public share page with dynamic OG metadata and anonymized results"
git push origin main
```

---

## Phase 11 — Email Confirmation & Ancillary Pages

### Step 11.1 — Confirmed Page (`src/app/confirmed/page.tsx`)

```typescript
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';

export default function ConfirmedPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">📬</div>
          <h1 className="text-3xl font-bold text-white mb-3">Check your inbox</h1>
          <p className="text-slate-400 mb-8">
            Your audit report is on its way. Check your email for a full breakdown and personalized recommendations.
          </p>
          <Button asChild className="bg-neon-green text-void font-bold">
            <Link href="/audit">Run another audit →</Link>
          </Button>
        </div>
      </main>
    </>
  );
}
```

### Step 11.2 — Custom 404 Page (`src/app/not-found.tsx`)

```typescript
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function GlobalNotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-neon-green font-mono text-sm mb-4">404</p>
        <h1 className="text-3xl font-bold text-white mb-3">Page not found</h1>
        <p className="text-slate-400 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Button asChild className="bg-neon-green text-void font-bold">
          <Link href="/">Go home →</Link>
        </Button>
      </div>
    </main>
  );
}
```

### Step 11.3 — Error Boundary (`src/app/error.tsx`)

```typescript
'use client';
import { Button } from '@/components/ui/button';

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-neon-red font-mono text-sm mb-4">500</p>
        <h1 className="text-3xl font-bold text-white mb-3">Something went wrong</h1>
        <p className="text-slate-400 mb-8">An unexpected error occurred. Your form data is safe in your browser.</p>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset} className="bg-neon-green text-void font-bold">Try again</Button>
          <Button asChild variant="outline" className="border-white/20 text-white">
            <a href="/">Go home</a>
          </Button>
        </div>
      </div>
    </main>
  );
}
```

---

## Phase 12 — OG Image Generation

**Goal:** Dynamic Open Graph images for social sharing, generated server-side with `@vercel/og`.

### Step 12.1 — OG Route (`src/app/api/og/route.tsx`)

```typescript
import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { db } from '@/lib/db/client';
import { audits } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { AuditResult } from '@/lib/audit/types';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const auditId = req.nextUrl.searchParams.get('auditId');
  if (!auditId) return new Response('Missing auditId', { status: 400 });

  const audit = await db.query.audits.findFirst({ where: eq(audits.id, auditId) });
  if (!audit) return new Response('Not found', { status: 404 });

  const savings = Number(audit.totalSavingsMonthly);
  const annualSavings = savings * 12;
  const data = audit.auditData as { results: AuditResult[] };
  const topTools = data.results
    .filter(r => r.savingsPerMonth > 0)
    .sort((a, b) => b.savingsPerMonth - a.savingsPerMonth)
    .slice(0, 3);

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex', flexDirection: 'column',
          width: '100%', height: '100%',
          background: 'linear-gradient(135deg, #080C14 0%, #0D1320 50%, #141B2D 100%)',
          padding: '48px', fontFamily: 'Inter, sans-serif',
          border: '1px solid rgba(0,255,135,0.2)',
        }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <span style={{ color: '#00FF87', fontSize: '24px', fontWeight: 800 }}>AuditIQ</span>
          <span style={{ color: '#475569', fontSize: '14px' }}>AI Spend Audit</span>
        </div>
        {/* Main savings number */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
          <p style={{ color: '#94A3B8', fontSize: '16px', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Annual AI Savings Found
          </p>
          <p style={{ color: '#00FF87', fontSize: savings > 0 ? '80px' : '48px', fontWeight: 900, margin: 0, lineHeight: 1, textShadow: '0 0 60px rgba(0,255,135,0.4)' }}>
            {savings > 0 ? `$${annualSavings.toLocaleString()}/yr` : 'Spending Optimized'}
          </p>
          {topTools.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '24px' }}>
              {topTools.map(t => (
                <div key={t.toolId} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ color: '#00FF87', fontSize: '14px', fontWeight: 700 }}>
                    ${t.savingsPerMonth}/mo
                  </span>
                  <span style={{ color: '#CBD5E1', fontSize: '14px' }}>
                    {t.toolName} — {t.recommendedAction.slice(0, 60)}...
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' }}>
          <span style={{ color: '#475569', fontSize: '14px' }}>auditiq.vercel.app</span>
          <span style={{ color: '#00FF87', fontSize: '13px' }}>Free · Instant · No account needed</span>
        </div>
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

### Step 12.2 — Commit

```bash
git add -A
git commit -m "feat: add dynamic OG image generation with @vercel/og"
git push origin main
```

---

## Phase 13 — Security Hardening

**Goal:** All security controls from `security-guidelines.md` applied before going live.

### Step 13.1 — Verify Security Headers

Run the app locally and check response headers:
```bash
curl -I http://localhost:3000 | grep -E "X-Frame|X-Content|Strict-Transport|Content-Security"
```

All four headers should be present.

### Step 13.2 — Input Validation Completeness Check

Review every API route:
- [ ] `POST /api/audit/submit` — Zod validation + honeypot check + rate limit
- [ ] `GET /api/audit/summary` — UUID format regex check before DB lookup
- [ ] `POST /api/leads/capture` — Zod validation + idempotency + rate limit
- [ ] `GET /api/og` — auditId presence check + DB lookup before rendering

### Step 13.3 — Environment Variable Hardening

Add startup validation in `src/lib/env.ts`:

```typescript
const REQUIRED_SERVER_VARS = [
  'DATABASE_URL', 'UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN',
  'ANTHROPIC_API_KEY', 'RESEND_API_KEY', 'NEXT_PUBLIC_APP_URL',
];

export function validateEnv() {
  const missing = REQUIRED_SERVER_VARS.filter(k => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
```

Call `validateEnv()` at the top of `src/lib/db/client.ts` and `src/lib/ai/summary.ts`.

### Step 13.4 — Run Security Audit

```bash
npm audit --audit-level=high
```

Fix any High or Critical findings before proceeding.

### Step 13.5 — Verify No Secrets in Git History

```bash
git log --all -p | grep -iE "(sk-ant|ANTHROPIC|SUPABASE|DATABASE_URL|RESEND)" | head -20
# Should return nothing
```

### Step 13.6 — Commit

```bash
git add -A
git commit -m "security: add env validation, verify security headers, run npm audit"
git push origin main
```

---

## Phase 14 — Automated Testing

**Goal:** Minimum 6 automated tests covering the audit engine, all passing with `npm test`.

### Step 14.1 — Audit Engine Tests (`src/test/audit-engine.test.ts`)

```typescript
import { describe, it, expect } from 'vitest';
import { runAudit } from '@/lib/audit/engine';
import type { AuditInput } from '@/lib/audit/types';

// Test 1: GitHub Copilot Business with 2 seats → recommend Individual
describe('GitHub Copilot', () => {
  it('recommends Individual plan for Business plan with 2 seats', () => {
    const input: AuditInput = {
      tools: [{ toolId: 'github_copilot', plan: 'business', seats: 2, monthlySpend: 38 }],
      teamSize: 2, useCase: 'coding',
    };
    const [result] = runAudit(input);
    expect(result.status).toBe('overspending');
    expect(result.savingsPerMonth).toBeGreaterThan(0);
    expect(result.recommendedAction).toMatch(/individual/i);
  });

  // Test 2: Already optimal → no false savings
  it('returns optimal with zero savings for a correctly-sized team on Individual', () => {
    const input: AuditInput = {
      tools: [{ toolId: 'github_copilot', plan: 'individual', seats: 1, monthlySpend: 10 }],
      teamSize: 1, useCase: 'coding',
    };
    const [result] = runAudit(input);
    expect(result.status).toBe('optimal');
    expect(result.savingsPerMonth).toBe(0);
  });
});

// Test 3: Use-case-specific alternative surfacing
describe('Use-case-specific recommendations', () => {
  it('recommends Claude over GitHub Copilot for writing use case', () => {
    const input: AuditInput = {
      tools: [{ toolId: 'github_copilot', plan: 'business', seats: 3, monthlySpend: 57 }],
      teamSize: 3, useCase: 'writing',
    };
    const [result] = runAudit(input);
    expect(result.status).toBe('switch_recommended');
    expect(result.recommendedAction.toLowerCase()).toMatch(/claude|chatgpt/);
  });
});

// Test 4: API monthly spend > $5,000 → review usage flag
describe('API direct spend', () => {
  it('flags high API spend as review-usage rather than specific plan switch', () => {
    const input: AuditInput = {
      tools: [{ toolId: 'anthropic_api', plan: 'usage_based', seats: 1, monthlySpend: 6000 }],
      teamSize: 5, useCase: 'coding',
    };
    const [result] = runAudit(input);
    expect(result.recommendedAction.toLowerCase()).toMatch(/review|cap|usage/);
  });
});

// Test 5: Total savings equals sum of per-tool savings
describe('Savings arithmetic', () => {
  it('total savings matches sum of individual tool savings', () => {
    const input: AuditInput = {
      tools: [
        { toolId: 'github_copilot', plan: 'business', seats: 2, monthlySpend: 38 },
        { toolId: 'cursor', plan: 'business', seats: 2, monthlySpend: 80 },
      ],
      teamSize: 2, useCase: 'coding',
    };
    const results = runAudit(input);
    const sumOfTools = results.reduce((s, r) => s + r.savingsPerMonth, 0);
    const totalFromEngine = results.reduce((s, r) => s + r.savingsPerMonth, 0);
    expect(sumOfTools).toBe(totalFromEngine);
  });
});

// Test 6: Edge case — 1 seat on per-seat plan handled correctly
describe('Edge cases', () => {
  it('handles 1 seat on a per-seat plan without crashing', () => {
    const input: AuditInput = {
      tools: [{ toolId: 'claude', plan: 'team', seats: 1, monthlySpend: 30 }],
      teamSize: 1, useCase: 'writing',
    };
    expect(() => runAudit(input)).not.toThrow();
    const [result] = runAudit(input);
    expect(result).toBeDefined();
    expect(typeof result.savingsPerMonth).toBe('number');
    expect(result.savingsPerMonth).toBeGreaterThanOrEqual(0);
  });

  it('returns zero savings for user already on free plan', () => {
    const input: AuditInput = {
      tools: [{ toolId: 'cursor', plan: 'hobby', seats: 1, monthlySpend: 0 }],
      teamSize: 1, useCase: 'coding',
    };
    const [result] = runAudit(input);
    expect(result.savingsPerMonth).toBe(0);
    expect(result.status).toBe('optimal');
  });
});
```

### Step 14.2 — Run Tests

```bash
npm test
# All 6+ tests should pass
```

If any test fails, fix the underlying audit rule. Do NOT adjust the test to make it pass — the test is the specification.

### Step 14.3 — Create `TESTS.md`

Document all tests at repo root per the assignment requirement. Format:

```markdown
# TESTS.md

## Test Suite: Audit Engine

**Test runner:** Vitest 2.1.9  
**How to run:** `npm test`  
**File:** `src/test/audit-engine.test.ts`

### Test 1 — GitHub Copilot Business → Individual Downgrade
**What it covers:** ...
**Expected outcome:** ...

[One entry per test]
```

### Step 14.4 — Commit

```bash
git add -A
git commit -m "test: add 6 audit engine tests covering all required test cases from PRD"
git push origin main
```

---

## Phase 15 — CI/CD Pipeline

**Goal:** Green CI on every push to `main`. Evaluators will check the GitHub Actions badge.

### Step 15.1 — Create GitHub Actions Workflow

Create `.github/workflows/ci.yml`:

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

      - name: Install dependencies
        run: npm ci

      - name: TypeScript typecheck
        run: npm run typecheck

      - name: Lint
        run: npm run lint

      - name: Run tests
        run: npm test

      - name: Security audit
        run: npm audit --audit-level=high
```

### Step 15.2 — Enable Branch Protection (Optional but Recommended)

In GitHub repo Settings → Branches → Branch protection rules → Add rule for `main`:
- [x] Require status checks to pass before merging
- [x] Select "lint-and-test" as required status check

### Step 15.3 — Commit and Verify CI Passes

```bash
git add -A
git commit -m "ci: add GitHub Actions workflow for lint, typecheck, test, and security audit"
git push origin main
```

Wait 2–3 minutes, then check GitHub → Actions tab. All steps should show green checkmarks.

---

## Phase 16 — Required Documentation Files

**Goal:** All 13 required repository files from `PRD.md §9` present and complete.

### Step 16.1 — Create `PRICING_DATA.md`

Document all 8 tools with official pricing URLs and verified dates. Format per PRD §8:

```markdown
# PRICING_DATA.md

All prices verified against official vendor pricing pages. Prices in USD per month unless noted.

## Cursor
- Hobby: $0/month — https://cursor.sh/pricing — verified 2026-05-10
- Pro: $20/user/month — https://cursor.sh/pricing — verified 2026-05-10
- Business: $40/user/month — https://cursor.sh/pricing — verified 2026-05-10

## GitHub Copilot
- Individual: $10/month (flat) — https://github.com/features/copilot — verified 2026-05-10
- Business: $19/user/month — https://github.com/features/copilot — verified 2026-05-10
- Enterprise: $39/user/month — https://github.com/features/copilot — verified 2026-05-10

[Continue for all 8 tools...]
```

> **Critical:** Verify each price against the actual pricing page on the day you write this file. Evaluators will spot-check.

### Step 16.2 — Create `PROMPTS.md`

Document the full Anthropic prompt verbatim with rationale and what didn't work:

```markdown
# PROMPTS.md

## Summary Generation Prompt

**Model:** claude-sonnet-4-20250514  
**Location:** `src/lib/ai/summary.ts`

### Full Prompt (verbatim)
[Copy the exact prompt from buildPrompt() in summary.ts]

### Rationale
- System role as financial analyst (not generic assistant) improves specificity
- Structured data block prevents prompt injection from user input
- Word count constraint (approximately 100 words) prevents verbose responses
- "Do not include dollar amounts already shown in the UI" prevents redundancy

### What Didn't Work
- Generic "helpful assistant" system prompt → outputs were too broad
- Asking for bullet points → disrupted the paragraph format needed for the prose block
- Including user email/company in prompt → increased hallucination risk with PII
```

### Step 16.3 — Create `ARCHITECTURE.md`

Document the system architecture with a Mermaid diagram, stack justification, data flow, and scale notes:

```markdown
# ARCHITECTURE.md

## System Diagram

```mermaid
flowchart TD
    A[Browser] -->|HTTPS| B[Vercel Edge CDN]
    B --> C[Next.js App Router]
    C -->|POST /api/audit/submit| D[Audit Engine]
    D -->|Pure TypeScript| D
    C -->|Save| E[Supabase Postgres]
    C -->|Rate limit| F[Upstash Redis]
    C -->|GET /api/audit/summary| G[Anthropic API]
    C -->|POST /api/leads/capture| H[Resend Email]
```

## Data Flow: Input → Audit Result
[Full prose description]

## Stack Justification
[Why Next.js, why Supabase, why Upstash, etc.]

## Open Design Decisions
1. Windsurf chosen over v0 because...
2. IP-based rate limiting chosen over hCaptcha because...
3. Flat rule file chosen because...

## What Changes at 10k Audits/Day
- Supabase: upgrade to Pro plan ($25/mo), enable pgBouncer connection pooling
- Upstash: upgrade to Pro for higher rate limit capacity
- Add ISR to /share/[auditId] pages
- Add Sentry for error tracking
```

### Step 16.4 — Create Remaining Documentation Files

Create the following files at repo root. Each must be substantive (not placeholder text):

- **`README.md`** — Product summary, 3 screenshots (take actual screenshots of the running app), quick start (`git clone → npm install → npm run dev`), 5 real trade-off decisions made, deployed URL.
- **`DEVLOG.md`** — One entry per day for all 7 days in exact format from PRD §DEVLOG section.
- **`REFLECTION.md`** — All 5 reflection questions answered at 150–400 words each.
- **`GTM.md`** — Go-to-market plan with exact communities, 100-user plan, distribution channel.
- **`ECONOMICS.md`** — Lead value math, CAC estimates, $1M ARR path.
- **`USER_INTERVIEWS.md`** — 3 real conversations (conduct these before day 4).
- **`LANDING_COPY.md`** — Headline, subheadline, CTA, social proof, 5 FAQs.
- **`METRICS.md`** — North Star metric, 3 input metrics, pivot threshold.

### Step 16.5 — Commit All Docs

```bash
git add -A
git commit -m "docs: add all required repository files — PRICING_DATA, PROMPTS, ARCHITECTURE, README, etc."
git push origin main
```

---

## Phase 17 — Deployment to Vercel

**Goal:** The app is live at a public URL with all environment variables configured and zero deployment errors.

### Step 17.1 — Push Final Code to GitHub

```bash
git status        # Should show clean working tree
git log --oneline # Verify at least 5 commits exist on distinct days
git push origin main
```

### Step 17.2 — Import Project to Vercel

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Select your GitHub repository `auditiq`
4. Vercel auto-detects Next.js — accept all defaults
5. **Before clicking Deploy**, click "Environment Variables"

### Step 17.3 — Add Environment Variables in Vercel Dashboard

Add the following to both **Production** and **Preview** environments:

| Variable | Value |
|---|---|
| `ANTHROPIC_API_KEY` | Your Anthropic key |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `DATABASE_URL` | Your Supabase connection string |
| `UPSTASH_REDIS_REST_URL` | Your Upstash Redis URL |
| `UPSTASH_REDIS_REST_TOKEN` | Your Upstash Redis token |
| `RESEND_API_KEY` | Your Resend API key |
| `RESEND_FROM_EMAIL` | e.g., `audit@onboarding.resend.dev` |
| `NEXT_PUBLIC_APP_URL` | Your Vercel deployment URL (e.g., `https://auditiq.vercel.app`) |

> **Note:** Set `NEXT_PUBLIC_APP_URL` to the deployment URL *before* deploying — if you don't know it yet, deploy once, get the URL, then add the variable and redeploy.

### Step 17.4 — Deploy

Click "Deploy." Vercel will:
1. Clone the repo
2. Run `npm ci`
3. Run `npm run build` (Next.js build)
4. Deploy to edge CDN

Typical deploy time: 2–4 minutes.

### Step 17.5 — Verify Deployment Succeeds

- Check Vercel dashboard — deployment should show "Ready" (green)
- Open the deployment URL in a browser
- Confirm the landing page loads without errors
- Open browser DevTools → Network → confirm no 500 errors on page load

### Step 17.6 — Update `NEXT_PUBLIC_APP_URL`

If you didn't know the URL before deploying:
1. Copy the deployment URL from Vercel dashboard (e.g., `https://auditiq.vercel.app`)
2. Go to Vercel → Project Settings → Environment Variables
3. Update `NEXT_PUBLIC_APP_URL` with the real URL
4. Trigger a redeploy (Vercel dashboard → Deployments → Redeploy latest)

### Step 17.7 — Verify Drizzle Migrations Ran in Production

The migrations were pushed directly to Supabase in Phase 2, so the production database already has the correct schema. Verify via Supabase Dashboard → Table Editor → confirm all 3 tables exist.

### Step 17.8 — Commit Deployment URL to README

```bash
# Update README.md with the live URL
git add README.md
git commit -m "docs: add production deployment URL to README"
git push origin main
```

---

## Phase 18 — Post-Deployment Verification

**Goal:** Every feature works end-to-end in production before submitting.

### Step 18.1 — Functional Smoke Test (Manual)

Run through this checklist on the **production URL**:

**Landing page (`/`)**
- [ ] Page loads in < 2 seconds
- [ ] "Run Your Own Audit →" button navigates to `/audit`
- [ ] FAQ accordion opens and closes
- [ ] Navbar is sticky and shows blur on scroll
- [ ] Mobile layout is single-column (test in DevTools responsive mode)

**Audit form (`/audit`)**
- [ ] Can add a tool (select tool name, plan, enter seats and spend)
- [ ] Running total updates as you type
- [ ] "Add tool" button works up to 8 tools
- [ ] Duplicate tool cannot be selected twice
- [ ] Page reload preserves form state (localStorage persistence)
- [ ] Form submits and redirects to `/results/[auditId]`
- [ ] 0 seats validation error shows correctly

**Results page (`/results/[auditId]`)**
- [ ] Hero savings number displays (counts up if > $0)
- [ ] Per-tool cards show with correct status badges
- [ ] AI summary loads (may take 3–5 seconds; skeleton shows during load)
- [ ] Credex CTA block displays appropriate variant based on savings tier
- [ ] Email capture form submits successfully (check Supabase `leads` table and inbox)
- [ ] Share link copies to clipboard
- [ ] Navigating to `/results/nonexistent-id` shows 404 message

**Share page (`/share/[publicSlug]`)**
- [ ] Page loads with correct savings data
- [ ] No PII visible (no email, company name)
- [ ] "Run your own audit →" CTA is present
- [ ] Paste share URL into Twitter card validator: https://cards-dev.twitter.com/validator — OG image should render

### Step 18.2 — Lighthouse Audit

Run Lighthouse on the **production URL** (not localhost):

```
Open Chrome → DevTools (F12) → Lighthouse tab
→ Select: Mobile
→ Categories: Performance, Accessibility, Best Practices, SEO
→ Click "Analyze page load"
```

**Required scores:**
- Performance ≥ 85
- Accessibility ≥ 90
- Best Practices ≥ 90

If any score is below target:
- Performance: check image sizes, remove unused JavaScript
- Accessibility: add missing `aria-label`, fix color contrast issues
- Best Practices: fix console errors, ensure HTTPS

### Step 18.3 — CI Green Check Verification

Confirm GitHub Actions CI shows green on the latest `main` commit:
- Go to GitHub repo → Actions tab
- Latest workflow run should show ✅ for all steps

### Step 18.4 — Git History Verification

```bash
git log --pretty=format:"%ad %s" --date=short | head -20
# Verify commits exist on at least 5 distinct calendar days

git log --pretty=format:"%ad" --date=short | sort -u | wc -l
# Should output ≥ 5
```

### Step 18.5 — Security Header Verification

Visit https://securityheaders.com and enter your production URL. Should score A or A+.

### Step 18.6 — Database Data Verification

After the smoke test, check Supabase Dashboard → Table Editor:
- `audits` table — should contain the test audit you just ran
- `leads` table — should contain the email you submitted
- `prompt_logs` table — may contain a log entry if the Anthropic summary was generated

---

## Phase 19 — Bonus Features (Post-MVP)

Attempt only after the full MVP is working and all required files are complete.

### 19.1 — PDF Export

Install `@react-pdf/renderer`:
```bash
npm install @react-pdf/renderer
```
Create `src/app/api/export/pdf/route.ts` — accepts `auditId`, fetches audit, renders a PDF report using React PDF primitives, returns as `application/pdf`. Add a "Download PDF" button to the results page.

### 19.2 — Benchmark Mode

Add a static dataset of "average AI spend per developer by team size" (sourced from public surveys or estimated). Show on the results page: "Your spend per developer is $X — the average for teams your size is $Y." This requires only frontend logic against a static JSON file.

### 19.3 — Embeddable Widget

Create `src/app/embed/page.tsx` — a minimal single-form version of the audit form with scoped CSS (via CSS modules, not Tailwind globals). Add a `<script>` tag instructions page showing how to embed it. Ensure the embed origin allows CORS.

### 19.4 — Plausible Analytics

Add Plausible to the layout for privacy-first analytics with no cookie consent required:
```typescript
// src/app/layout.tsx — add to <head>
<Script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js" />
```
Fire custom events with `window.plausible('audit_completed', { props: { use_case: useCase } })` at each key funnel step.

---

## Complete File & Folder Structure Reference

```
auditiq/
├── .github/
│   └── workflows/
│       └── ci.yml
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── audit/
│   │   │   │   ├── submit/route.ts
│   │   │   │   └── summary/route.ts
│   │   │   ├── leads/
│   │   │   │   └── capture/route.ts
│   │   │   └── og/route.tsx
│   │   ├── audit/
│   │   │   └── page.tsx
│   │   ├── confirmed/
│   │   │   └── page.tsx
│   │   ├── results/
│   │   │   └── [auditId]/
│   │   │       ├── page.tsx
│   │   │       └── not-found.tsx
│   │   ├── share/
│   │   │   └── [auditId]/
│   │   │       └── page.tsx
│   │   ├── error.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── audit/
│   │   │   └── AuditForm.tsx
│   │   ├── landing/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── HowItWorksSection.tsx
│   │   │   ├── ToolsGridSection.tsx
│   │   │   ├── SampleAuditSection.tsx
│   │   │   └── FAQSection.tsx
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   ├── results/
│   │   │   ├── HeroSavingsBlock.tsx
│   │   │   ├── ToolResultCards.tsx
│   │   │   ├── AISummaryBlock.tsx
│   │   │   ├── CredexCTABlock.tsx
│   │   │   ├── EmailCaptureForm.tsx
│   │   │   └── ShareBlock.tsx
│   │   ├── three/
│   │   │   └── BackgroundCanvas.tsx
│   │   └── ui/                        ← shadcn/ui components (auto-generated)
│   ├── lib/
│   │   ├── ai/
│   │   │   └── summary.ts
│   │   ├── audit/
│   │   │   ├── engine.ts
│   │   │   ├── pricing.ts
│   │   │   ├── tool-config.ts
│   │   │   ├── types.ts
│   │   │   └── rules/
│   │   │       ├── cursor.ts
│   │   │       ├── github-copilot.ts
│   │   │       ├── claude.ts
│   │   │       ├── chatgpt.ts
│   │   │       ├── anthropic-api.ts
│   │   │       ├── openai-api.ts
│   │   │       ├── gemini.ts
│   │   │       └── windsurf.ts
│   │   ├── db/
│   │   │   ├── client.ts
│   │   │   ├── schema.ts
│   │   │   └── migrations/
│   │   ├── email/
│   │   │   ├── client.ts
│   │   │   └── templates/
│   │   │       └── AuditConfirmation.tsx
│   │   ├── rate-limit/
│   │   │   └── index.ts
│   │   ├── validators/
│   │   │   ├── audit-input.ts
│   │   │   └── lead-input.ts
│   │   ├── env.ts
│   │   └── logger.ts
│   ├── store/
│   │   └── auditFormStore.ts
│   ├── test/
│   │   ├── setup.ts
│   │   └── audit-engine.test.ts
│   └── types/
│       └── api.ts
├── .env.example
├── .gitignore
├── ARCHITECTURE.md
├── DEVLOG.md
├── ECONOMICS.md
├── GTM.md
├── LANDING_COPY.md
├── METRICS.md
├── PRICING_DATA.md
├── PROMPTS.md
├── README.md
├── REFLECTION.md
├── TESTS.md
├── USER_INTERVIEWS.md
├── drizzle.config.ts
├── next.config.ts
├── package.json
├── package-lock.json
├── tailwind.config.ts
├── tsconfig.json
└── vitest.config.ts
```

---

## Environment Variables Reference

| Variable | Scope | Where to Get It |
|---|---|---|
| `ANTHROPIC_API_KEY` | Server only | console.anthropic.com → API Keys |
| `NEXT_PUBLIC_SUPABASE_URL` | Public (client + server) | Supabase Dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public (client + server) | Supabase Dashboard → Project Settings → API |
| `DATABASE_URL` | Server only | Supabase Dashboard → Project Settings → Database → Connection String |
| `UPSTASH_REDIS_REST_URL` | Server only | Upstash Console → Database detail |
| `UPSTASH_REDIS_REST_TOKEN` | Server only | Upstash Console → Database detail |
| `RESEND_API_KEY` | Server only | Resend Dashboard → API Keys |
| `RESEND_FROM_EMAIL` | Server only | Your verified sending domain (or `onboarding@resend.dev` for dev) |
| `NEXT_PUBLIC_APP_URL` | Public (client + server) | Your Vercel deployment URL |

**Security rules:**
- Variables prefixed `NEXT_PUBLIC_` are exposed to the browser — never put secrets there.
- All secret variables (`ANTHROPIC_API_KEY`, `DATABASE_URL`, etc.) are server-only — accessible only in API routes and Server Components, never in `'use client'` files.
- `.env.local` is gitignored and must never be committed.
- Vercel encrypts environment variables at rest and injects them at runtime.

---

## Day-by-Day Execution Schedule (7-Day Plan)

This schedule assumes 6–8 hours of focused work per day. Adjust based on experience level.

### Day 1 (Phase 0–3) — Foundation
- [ ] Create all service accounts (Vercel, Supabase, Upstash, Resend, Anthropic)
- [ ] Initialize repo, `.gitignore`, `.env.example`, first commit
- [ ] Scaffold Next.js 14 with all dependencies installed
- [ ] Configure TypeScript, Tailwind, shadcn/ui, Vitest
- [ ] Create database schema and push migrations to Supabase
- [ ] Implement core types, validators, logger, rate limiter, middleware
- [ ] Verify `npm run dev` and `npm run typecheck` pass
- [ ] Write Day 1 DEVLOG entry

**Commit target:** 3–4 commits. End of Day 1 should have a running dev server.

### Day 2 (Phase 4) — Audit Engine
- [ ] Implement `pricing.ts` with all verified prices from official pages
- [ ] Implement `engine.ts` master runner
- [ ] Implement all 8 tool rule files (this is the most logic-intensive work)
- [ ] Write and run the 6 audit engine tests
- [ ] Verify `npm test` passes
- [ ] Write Day 2 DEVLOG entry

**Commit target:** 3–5 commits. The audit engine is the product's core — do not rush it.

### Day 3 (Phase 5) — API Routes
- [ ] Implement `POST /api/audit/submit`
- [ ] Implement `GET /api/audit/summary` + `src/lib/ai/summary.ts`
- [ ] Implement `POST /api/leads/capture`
- [ ] Create React Email template
- [ ] Test all three routes with curl or Postman locally
- [ ] Write Day 3 DEVLOG entry

**Commit target:** 3 commits. One per API route.

### Day 4 (Phase 6–8) — Frontend Core
- [ ] Build global layout, navbar, footer
- [ ] Build landing page (hero, how-it-works, tools grid, FAQ)
- [ ] Build spend input form with Zustand persistence
- [ ] Verify localStorage persistence on page reload
- [ ] Verify form submission redirects to results URL
- [ ] Write Day 4 DEVLOG entry + conduct 1 user interview

**Commit target:** 4–5 commits.

### Day 5 (Phase 9–12) — Results & Sharing
- [ ] Build results page (hero savings, tool cards, AI summary, Credex CTA, email form, share block)
- [ ] Build share page with OG metadata
- [ ] Implement OG image generation
- [ ] Build confirmed, 404, and error pages
- [ ] Full manual smoke test of complete user flow locally
- [ ] Write Day 5 DEVLOG entry + conduct 2 more user interviews

**Commit target:** 4–5 commits.

### Day 6 (Phase 13–17) — Security, CI, and Deploy
- [ ] Security hardening (headers, env validation, `npm audit`)
- [ ] Create `.github/workflows/ci.yml`
- [ ] Create `PRICING_DATA.md` (verify all prices on this day)
- [ ] Create `PROMPTS.md`, `ARCHITECTURE.md`
- [ ] Deploy to Vercel with all environment variables
- [ ] Run Lighthouse audit on production URL → fix any failing scores
- [ ] Write Day 6 DEVLOG entry

**Commit target:** 3–4 commits. CI must be green by end of day.

### Day 7 (Phase 16 + 18) — Documentation & Polish
- [ ] Write `README.md` with screenshots and deployed URL
- [ ] Write `DEVLOG.md` entries for all 7 days (retroactively fill earlier days)
- [ ] Write `REFLECTION.md` (all 5 questions, 150–400 words each)
- [ ] Write `GTM.md`, `ECONOMICS.md`, `USER_INTERVIEWS.md`, `LANDING_COPY.md`, `METRICS.md`
- [ ] Final full smoke test in production
- [ ] Verify git history has commits on ≥ 5 distinct days
- [ ] Verify CI is green
- [ ] Write Day 7 DEVLOG entry
- [ ] Submit Google Form

**Commit target:** 3–5 commits. All documentation must be substantive.

---

## Evaluation Rubric Alignment Checklist

Use this to self-evaluate before submitting. Each item maps directly to the rubric from `PRD.md §12`.

### Entrepreneurial Thinking (25 pts)
- [ ] `GTM.md` — exact target user, what they Google, specific communities (Hacker News, IndieHackers, etc.), 100-user plan, unfair channel, week-1 traction definition
- [ ] `ECONOMICS.md` — lead value estimate, CAC per channel, funnel math to profitability, $1M ARR path with specific numbers
- [ ] `USER_INTERVIEWS.md` — 3 real people interviewed (not fabricated), 10+ minutes each, name/initials, role, company stage, 3+ quotes per interview, most surprising learning
- [ ] `LANDING_COPY.md` — headline ≤10 words, subheadline ≤25 words, CTA copy, social proof block, 5 FAQ Q&As
- [ ] `METRICS.md` — North Star metric with justification, 3 input metrics, what to instrument first, pivot threshold number

### Engineering Skills (15 pts)
- [ ] Git history — commits on ≥5 distinct calendar days, Conventional Commits format
- [ ] CI — GitHub Actions showing green checks on latest `main` commit
- [ ] Tests — minimum 6 automated tests, all pass with `npm test`
- [ ] Deployed — live URL is reachable and all 6 MVP features work
- [ ] Accessibility — Lighthouse Accessibility ≥ 90 on mobile

### Thinking Models (15 pts)
- [ ] `ARCHITECTURE.md` — Mermaid diagram present, data flow documented, stack justification with reasons, scale notes for 10k audits/day
- [ ] `REFLECTION.md` — All 5 questions answered with specificity (hypotheses, attempts, what worked — not vague summaries)
- [ ] `README.md` — 5 trade-off decisions that are non-trivial and show real judgment

### Programming Skills (15 pts)
- [ ] TypeScript strict mode — `"strict": true` in tsconfig, no `any` casts without comments
- [ ] Readable abstractions — audit rules are in separate files, not one 500-line blob
- [ ] No obvious bugs — 0 seats doesn't crash, API failures fall back gracefully, rate limit handles correctly
- [ ] Type safety end-to-end — Zod schemas match TypeScript types, Drizzle inferred types used

### Hard Work (10 pts)
- [ ] All 6 MVP features work (form, audit engine, results page, AI summary, email capture, share URL)
- [ ] UI is polished — glass cards, dark theme, count-up animation, skeleton loaders, toast notifications
- [ ] At least one bonus feature attempted

### Discipline & Consistency (10 pts)
- [ ] `DEVLOG.md` — all 7 days have entries in exact required format
- [ ] Commits spread across ≥5 distinct calendar days within the 7-day window
- [ ] No "fix stuff" commit messages — all follow Conventional Commits

### Audit Logic Polish (10 pts)
- [ ] Every savings recommendation is traceable to a real pricing page in `PRICING_DATA.md`
- [ ] No false savings manufactured — optimal plan returns $0 savings
- [ ] Reasoning sentences (`reason` field) would satisfy a CFO reading the output
- [ ] Edge cases handled: 0 seats, 1 seat on team plan, $0 monthly spend, all tools optimal

---

*This implementation plan is the authoritative execution guide for AuditIQ. Every design decision made here is traceable to the PRD, TECHSTACK, APPFLOW, frontend_guidelines, backend_guidelines, and security-guidelines documents. When in doubt about any implementation detail not covered here, default to the most straightforward, lowest-friction option consistent with the product's goal: converting cold visitors into qualified Credex leads while demonstrating genuine engineering and entrepreneurial capability.*

*Last reviewed: 2026-05-10 — Re-read the relevant guideline document before making any significant deviation from this plan.*
