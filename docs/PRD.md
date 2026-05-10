# PRD: AI Spend Audit Tool
### Product Requirements Document — Credex Web Dev Intern Assignment

**Version:** 1.0  
**Prepared for:** Credex Round 1 Submission  
**Date:** 2026-05-07  
**Deadline:** 7 days from assignment receipt

---

## 1. What This Product Is

**AI Spend Audit** is a free, no-login web tool that tells startup founders and engineering managers exactly where they're wasting money on AI tools — and what to do about it.

A user inputs the AI subscriptions their team pays for (tool, plan, seats, monthly spend). The app runs a rule-based audit engine, produces an itemized breakdown of overspend, recommends cheaper alternatives or plan downgrades, and shows a hero total of potential monthly + annual savings. An LLM then generates a short personalized summary paragraph. If savings are significant, the tool surfaces Credex (which sells discounted AI credits) as the way to capture more of those savings.

The result page gets a unique public URL the user can share. Email is captured *after* the audit result is shown — never before. Captured leads go into a real backend database and trigger a transactional confirmation email.

**One-line pitch:** *"Mint for AI tool spend — free audit, instant results, no account required."*

---

## 2. The Problem Being Solved

Most startups pay full retail for AI tools (Cursor, Claude, ChatGPT, GitHub Copilot, etc.) without knowing:
- Whether they're on the right plan for their usage level
- Whether a cheaper alternative exists for their use case
- Whether they could get the same tools at a discount through credits

There is no independent, neutral tool that audits this for them. Credex is uniquely positioned to build one, because the audit surfaces overspend, and Credex is the solution to overspend.

---

## 3. Target Users

**Primary:** Engineering Manager or CTO at a startup with 2–30 engineers, Series A or earlier.  
**Secondary:** Solo founder or indie developer paying for multiple AI subscriptions out of pocket.

**When they'd use this:** After getting a monthly SaaS invoice that feels high, or when evaluating AI tool budgets for a new hire round.

---

## 4. User Flow (End-to-End)

```
Landing page (cold visitor)
        ↓
Spend input form (no login)
        ↓
Instant audit results page
        ↓
[Optional] Email capture (shown after results, not before)
        ↓
Transactional confirmation email sent
        ↓
Shareable unique public URL (identifying info stripped)
        ↓
[High-savings path] Credex consultation CTA surfaced prominently
```

---

## 5. MVP Features (All 6 Required)

### 5.1 Spend Input Form

**What it does:** Collects the user's current AI tool subscriptions.

**Tools supported (minimum, as of submission week):**

| Tool | Plans Supported |
|---|---|
| Cursor | Hobby / Pro / Business / Enterprise |
| GitHub Copilot | Individual / Business / Enterprise |
| Claude (Anthropic) | Free / Pro / Max / Team / Enterprise / API direct |
| ChatGPT (OpenAI) | Plus / Team / Enterprise / API direct |
| Anthropic API (direct) | Usage-based |
| OpenAI API (direct) | Usage-based |
| Gemini (Google) | Pro / Ultra / API |
| Windsurf OR v0 | Choose one additional tool |

**Per-tool inputs:**
- Which plan
- Current monthly spend (USD)
- Number of seats

**Global inputs:**
- Total team size (number of people)
- Primary use case: `coding` / `writing` / `data analysis` / `research` / `mixed`

**Persistence:** Form state must survive page reload (use `localStorage`).

**UX notes:**
- Add tools incrementally (start with 1, add more via "+ Add tool")
- Show running total of monthly spend in the form as the user fills it in
- Allow free-form monthly spend entry for API tools (usage varies month to month)

---

### 5.2 Audit Engine

**What it does:** For each tool the user entered, evaluates whether they're on the optimal plan and whether a cheaper alternative exists.

**Logic per tool (four questions evaluated):**

1. **Right plan for team size?**  
   e.g., GitHub Copilot Business for a 2-person team when Individual is cheaper and sufficient.

2. **Cheaper plan from same vendor?**  
   e.g., Claude Team at $30/seat when Claude Pro at $20 would suffice for the use case.

3. **Cheaper alternative tool with similar capability?**  
   Use-case-specific. e.g., for pure coding, Cursor Pro vs GitHub Copilot Business vs Claude Code — compare output quality-per-dollar for the stated use case.

4. **Retail pricing when credits available?**  
   Surface Credex as a discount source for tools where credits exist.

**Output per tool:**
- `status`: `optimal` | `overspending` | `switch_recommended`
- `current_monthly_spend`: number
- `recommended_action`: string (1–2 sentences, specific)
- `savings_per_month`: number
- `reason`: string (1 sentence — must be defensible to a finance person)

**Audit engine rules:**
- Written as pure deterministic functions — no AI for the math itself
- Every threshold and recommendation must be traceable to a real pricing page
- No manufactured savings — if a user is already on the optimal plan, say so
- Rules must be readable and testable in isolation (for `TESTS.md` and CI)

**Example rule (written out explicitly for clarity):**

```
IF tool = "GitHub Copilot"
  AND plan = "Business"  ($19/user/month)
  AND seats <= 3
  AND use_case IN ["coding", "mixed"]
THEN
  recommend = "Downgrade to Individual ($10/month flat). Business plan adds SSO and audit logs — unnecessary for teams under 5."
  savings = (seats * 19) - 10
```

---

### 5.3 Audit Results Page

**Layout:**

1. **Hero block** (top, above fold):  
   - Total monthly savings: `$X,XXX/mo`  
   - Total annual savings: `$XX,XXX/yr`  
   - Both large, bold, unmistakable

2. **Per-tool breakdown** (below hero):  
   For each tool entered: current spend → recommended action → savings → 1-sentence reason  
   Use a card layout. Color-code: green for optimal, amber for overspending, red for switch recommended.

3. **AI-generated personalized summary** (below cards):  
   ~100 words. Plain language. Generated by Anthropic API.

4. **Credex CTA** (conditional):  
   - If total savings > $500/mo: Show Credex prominently as the way to capture those savings. Headline + booking link.  
   - If total savings < $100/mo OR already optimal: Show "You're spending well" message. Offer "Notify me when new optimizations apply to your stack" signup.  
   - Middle range: Show Credex as a secondary option.

5. **Email capture** (below results, never before):  
   - Fields: Email (required), Company name (optional), Role (optional), Team size (optional)  
   - CTA copy varies by savings tier

6. **Share button**: Copies unique public URL to clipboard.

**Visual quality requirement:** This page gets screenshotted and shared on Twitter/LinkedIn. It must look like a real SaaS product's output, not a school project.

---

### 5.4 AI-Generated Personalized Summary

**What it does:** Calls the Anthropic API with the audit data and generates a ~100-word paragraph summarizing the user's situation in plain English.

**Requirements:**
- Model: Use claude-sonnet-4-20250514 (or latest available at submission)
- Prompt must be saved verbatim in `PROMPTS.md` with rationale
- Must handle API failure gracefully: fall back to a rule-based template string
- The fallback must not be obviously robotic — write a good template
- Do NOT use AI for the savings math — only for the narrative summary
- Log prompt + response (sanitized) to backend for later analysis

**Prompt structure (design this properly):**
```
System: You are a financial analyst specializing in SaaS tool optimization for startups...
User: [structured audit data including tools, plans, spend, use case, savings identified]
     Generate a 100-word plain-language paragraph summarizing...
```

---

### 5.5 Lead Capture + Storage

**What it does:** Captures email after showing the audit result, stores it in a real backend, and sends a confirmation email.

**Form fields:**
- Email (required)
- Company name (optional)
- Role (optional)
- Team size (optional)

**Backend storage:** Choose one — Supabase (recommended for speed), Firebase, Cloudflare D1, or Render Postgres. Document your choice in `ARCHITECTURE.md`.

**Schema (minimum):**
```
leads table:
  id (uuid, PK)
  email (text, not null)
  company_name (text, nullable)
  role (text, nullable)
  team_size (int, nullable)
  audit_id (uuid, FK to audits)
  created_at (timestamp)
  savings_per_month (numeric)
  high_value (boolean)  -- true if savings > $500/mo

audits table:
  id (uuid, PK)
  audit_data (jsonb)  -- full tool input + audit output
  use_case (text)
  total_savings_monthly (numeric)
  created_at (timestamp)
  public_slug (text, unique)  -- used in shareable URL
```

**Transactional email:**
- Provider: Resend (recommended), Postmark, or AWS SES free tier
- Trigger: on lead capture form submission
- Content: confirms audit, lists top 2 recommendations, notes Credex will reach out for high-savings cases
- Must use a real domain or subdomain (not noreply@gmail.com)

**Abuse protection:** Choose ONE and document why:
- Rate limiting by IP (e.g., 5 audits/hour via Upstash Redis or Cloudflare Rate Limiting)
- Honeypot field (hidden input; if filled, silently discard)
- hCaptcha (adds friction, but strongest protection)
- Document your choice + tradeoffs in `ARCHITECTURE.md`

---

### 5.6 Shareable Result URL

**What it does:** Each audit gets a unique permanent URL that can be shared publicly.

**URL format:** `https://yourdomain.com/audit/[unique-slug]`  
Slug: 8–12 character alphanumeric, generated at audit creation time.

**Public vs. private data:**
- **Shown publicly:** Tools used, plans, savings amounts, recommendations, AI summary
- **Stripped from public URL:** Company name, email, role, any PII

**Open Graph tags (required):**
```html
<meta property="og:title" content="I found $X,XXX/yr in AI tool savings" />
<meta property="og:description" content="Free AI spend audit — see what your team could save" />
<meta property="og:image" content="[dynamically generated OG image]" />
<meta name="twitter:card" content="summary_large_image" />
```

**OG image:** Generate dynamically (use `@vercel/og`, `satori`, or a canvas-based approach). Must show savings number prominently. This is the viral hook.

---

## 6. Bonus Features (Only After MVP Works)

Attempt in order of ROI:

1. **PDF export** — Full report downloadable as PDF. Use `react-pdf` or `puppeteer`.
2. **Benchmark mode** — "Your AI spend per developer is $X — companies your size average $Y." Requires seed data or external benchmarks.
3. **Embeddable widget** — `<script>` tag version that bloggers/newsletters can drop in. Scoped CSS, minimal footprint.
4. **Referral codes** — Share the tool, both parties get a perk (e.g., extended Credex trial).
5. **Blog post / Twitter thread draft** — Written as if you were launching the tool on Product Hunt.

---

## 7. Technical Constraints

| Constraint | Requirement |
|---|---|
| Frontend framework | React, Next.js, Vue, Svelte, SolidJS, or vanilla. Justify in `ARCHITECTURE.md`. |
| Language | TypeScript strongly preferred. If JS, justify why. |
| Styling | Tailwind, shadcn/ui, MUI, Mantine, or headless primitives. No website builders. |
| No templates | No admin dashboard templates. Build the UI yourself. |
| Lighthouse (mobile, deployed URL) | Performance ≥ 85, Accessibility ≥ 90, Best Practices ≥ 90 |
| Secrets | No secrets in repo. All via environment variables. |
| Deployment | Vercel, Netlify, Cloudflare Pages, Render, or Fly.io. Must be live when reviewed. |

---

## 8. Pricing Data Requirements

Every dollar amount in the audit engine must be sourced from an official vendor pricing page, cited with a URL and the date it was verified.

Stored in `PRICING_DATA.md` at repo root.

**Example format:**
```markdown
## Cursor
- Hobby: $0/month — https://cursor.sh/pricing — verified 2026-05-07
- Pro: $20/user/month — https://cursor.sh/pricing — verified 2026-05-07
- Business: $40/user/month — https://cursor.sh/pricing — verified 2026-05-07
```

All 8+ tools must be listed. Prices must be current as of submission week. Evaluators will spot-check.

---

## 9. Required Repository Files

All files at repo root, in plain Markdown.

### Engineering Files

| File | Contents |
|---|---|
| `README.md` | 2–3 sentence summary; 3+ screenshots or 30-sec Loom; quick start; 5 trade-off decisions; deployed URL |
| `ARCHITECTURE.md` | Mermaid system diagram; data flow (input → audit result); stack justification; what changes at 10k audits/day |
| `DEVLOG.md` | One entry per day for all 7 days, exact format (see below) |
| `REFLECTION.md` | 5 questions answered, 150–400 words each |
| `TESTS.md` | Every automated test: filename, what it covers, how to run |
| `PRICING_DATA.md` | All tool pricing with vendor URL + verified date |
| `PROMPTS.md` | Full LLM prompts, rationale, what didn't work |
| `.github/workflows/ci.yml` | Lint + test on push to main, must show green checks |

### Entrepreneurial Files

| File | Contents |
|---|---|
| `GTM.md` | Exact target user; what they Google before wanting this; specific online communities; 100-user plan with $0 budget; unfair distribution channel; week-1 traction definition |
| `ECONOMICS.md` | Lead value estimate; CAC per channel; conversion funnel to profitability; $1M ARR in 18 months math |
| `USER_INTERVIEWS.md` | 3 real conversations, 10–15 min each: name/initials, role, company stage, 3+ quotes, most surprising thing, what it changed |
| `LANDING_COPY.md` | Hero headline (≤10 words); subheadline (≤25 words); CTA copy; social proof block; 5 FAQ Q&As |
| `METRICS.md` | North Star metric + why; 3 input metrics; what to instrument first; pivot threshold number |

---

### DEVLOG.md Entry Format (Exact)

```markdown
## Day 1 — YYYY-MM-DD

**Hours worked:** X
**What I did:** ...
**What I learned:** ...
**Blockers / what I'm stuck on:** ...
**Plan for tomorrow:** ...
```

One entry for every calendar day, including days with 0 hours worked (write why).

---

### REFLECTION.md Questions

1. The hardest bug you hit and exactly how you debugged it (hypotheses, attempts, what worked)
2. A decision you reversed mid-week and why
3. What you'd build in week 2
4. How you used AI tools (which tool, for what, what you didn't trust it with, one time the AI was wrong and you caught it)
5. Self-rating 1–10 for: discipline, code quality, design sense, problem-solving, entrepreneurial thinking — one sentence reason for each

---

## 10. Test Requirements

Minimum 5 automated tests, all covering the audit engine specifically.

**Suggested test cases:**
1. Correct savings calculation for a user on GitHub Copilot Business with 2 seats (should recommend Individual)
2. No false savings generated for a user already on optimal plan
3. Use-case-specific alternative surfacing (e.g., pure coding use case gets Cursor Pro recommendation over Claude Team)
4. API monthly spend above a threshold flags as "review usage" rather than specific plan switch
5. Audit result total equals sum of per-tool savings
6. Edge case: 0 seats entered doesn't crash; 1 seat on a "per-seat" plan handled correctly

Tests must actually run with `npm test` or `pytest`. Evaluators will run them.

---

## 11. Git History Requirements

- Commits on **at least 5 distinct calendar days** within the 7-day window
- Use Conventional Commits format: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `test:`
- Meaningful commit messages: `fix: handle Anthropic 429 gracefully in summary fallback` not `fix stuff`
- Verify yourself before submitting: `git log --pretty=format:"%ad" --date=short | sort -u | wc -l`

---

## 12. Evaluation Rubric

| Dimension | Weight | Notes |
|---|---|---|
| Entrepreneurial thinking | 25 pts | GTM, Economics, User Interviews, Landing Copy, Metrics — all show real founder thinking |
| Engineering skills | 15 pts | Git hygiene, CI green, ≥5 working tests, deployed, accessibility |
| Thinking models | 15 pts | Architecture depth, Reflection specificity, README Decisions non-trivial |
| Programming skills | 15 pts | Readable, typed, sensible abstractions, no obvious bugs |
| Hard work | 10 pts | All 6 MVP features work, polished UI, bonus attempted |
| Discipline & consistency | 10 pts | DEVLOG has 7 dated entries, commits across ≥5 days |
| Audit logic polish | 10 pts | Finance-literate person reads reasoning and agrees |

**Total: 100 points**

---

## 13. Submission

A single Google Form response containing:

1. Public GitHub repo URL (public repo, contains all required files)
2. Live deployed URL (must be reachable)
3. All required files at repo root (listed in Section 9)
4. Git history showing commits on ≥5 distinct calendar days

Missing any item = automatic rejection before human review.

---

## 14. Ground Rules

- AI tools (Cursor, Claude, Copilot, etc.) are **allowed and expected**. Disclose usage in `REFLECTION.md`. A one-shot generated codebase is an auto-reject — evaluators can tell.
- User interviews are **real**. Three actual humans, 10–15 min each. Fabricated interviews pattern-match obviously and are an instant reject.
- Pricing data must be **accurate and cited**. Spot-checked.
- No private dependencies, no closed-source libraries, no hardcoded secrets.
- Handle ambiguity by making a documented assumption in `DEVLOG.md` and moving on.
- By submitting, you grant Credex a non-exclusive license to learn from public elements. You retain full code ownership.

---

## 15. Recommended Tech Stack (Opinion, Not Requirement)

| Layer | Recommendation | Rationale |
|---|---|---|
| Framework | Next.js 14+ (App Router) | SSR for OG images, API routes, Vercel deploy is trivial |
| Language | TypeScript | Required for audit engine type safety |
| Styling | Tailwind + shadcn/ui | Fast, accessible, no template feel if customized well |
| Backend | Supabase | Free tier, Postgres, real-time, auth if needed later |
| Email | Resend | Best DX, generous free tier, works with Next.js |
| OG Images | @vercel/og | Built for Next.js, edge runtime |
| Testing | Vitest | Fast, TypeScript-native, works with Next.js |
| Deployment | Vercel | Zero-config Next.js, preview URLs per PR |
| Rate limiting | Upstash Redis | Serverless-compatible, generous free tier |

---

## 16. Open Questions / Decisions to Document

These are judgment calls you'll make and document in `ARCHITECTURE.md` or `DEVLOG.md`:

1. **Which additional tool to support**: Windsurf or v0? (Consider which has more defensible pricing data and more interesting audit logic.)
2. **Abuse protection method**: Rate limiting vs honeypot vs hCaptcha — tradeoffs in UX friction vs protection level.
3. **OG image generation approach**: Server-side at request time vs pre-generated at audit creation vs static template.
4. **API spend inputs**: How to handle variable monthly API usage — use a monthly average input, or ask for usage metrics (tokens/requests)?
5. **Audit engine architecture**: Flat rule file vs class per tool vs configuration-driven JSON rules?
6. **Form UX**: Linear single-page form vs multi-step wizard — which is lower friction for the target user?

---

*This PRD is a working document. Decisions made during development should be logged in DEVLOG.md. Any scope cuts should be noted with rationale. The goal is a shippable product, not a perfect spec.*
