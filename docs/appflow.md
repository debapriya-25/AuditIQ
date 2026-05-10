# APPFLOW.md — AI Spend Audit Tool
### Complete Application Behavior Specification (User Perspective)

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [User Roles and Permissions](#2-user-roles-and-permissions)
3. [Navigation Architecture](#3-navigation-architecture)
4. [Page-by-Page Specification](#4-page-by-page-specification)
   - 4.1 [Landing Page — `/`](#41-landing-page--)
   - 4.2 [Spend Input Form — `/audit`](#42-spend-input-form----audit)
   - 4.3 [Audit Results Page — `/results/[auditId]`](#43-audit-results-page----resultsauditid)
   - 4.4 [Shared Public Audit — `/share/[auditId]`](#44-shared-public-audit----shareauditid)
   - 4.5 [Email Confirmation — `/confirmed`](#45-email-confirmation----confirmed)
   - 4.6 [404 Page](#46-404-page)
   - 4.7 [500 / Error Page](#47-500--error-page)
5. [Complete User Flows](#5-complete-user-flows)
   - 5.1 [Cold Visitor → Audit → Lead Capture Flow](#51-cold-visitor--audit--lead-capture-flow)
   - 5.2 [Form Persistence Flow (Page Reload)](#52-form-persistence-flow-page-reload)
   - 5.3 [Audit Submission Flow](#53-audit-submission-flow)
   - 5.4 [AI Summary Generation Flow](#54-ai-summary-generation-flow)
   - 5.5 [Email Capture Flow](#55-email-capture-flow)
   - 5.6 [Share Flow](#56-share-flow)
   - 5.7 [High-Savings CTA Flow](#57-high-savings-cta-flow)
   - 5.8 [Already-Optimal Flow](#58-already-optimal-flow)
6. [Component Behavior Library](#6-component-behavior-library)
7. [State Management Map](#7-state-management-map)
8. [Error and Edge Case Handling](#8-error-and-edge-case-handling)
9. [Responsive Behavior](#9-responsive-behavior)

---

## 1. Product Overview

### What the Product Does

AI Spend Audit is a **free, no-login web tool** that audits a startup's AI tool subscriptions and tells them exactly where they're overspending, what to switch or downgrade, and how much they'd save. The user inputs their current AI subscriptions (tool, plan, seats, monthly cost). The app runs a deterministic rule-based engine against current verified pricing data, produces an itemized breakdown per tool, and renders a hero total of monthly + annual savings. The Anthropic API generates a short personalized plain-English summary of the audit. The result page receives a unique public URL for sharing. After seeing results, the user is optionally invited to enter their email to receive a PDF copy and — for high-savings cases — to book a Credex consultation for discounted AI credits.

### Who the Users Are

**Primary user:** Engineering Manager or CTO at a startup, 2–30 engineers, Series A or earlier. They manage the company's SaaS budget. They opened this page after receiving a monthly bill that felt too high or while planning headcount expansion.

**Secondary user:** Solo founder or indie developer personally paying for 2–5 AI subscriptions and unsure whether they're getting value for money.

**Referral viewer:** A colleague, investor, or team member who received a shared audit URL. They see the public (anonymized) version of the results. They did not fill in the form themselves.

### What Problems It Solves

1. **No benchmark exists** — startups have no way to know whether their AI tool spend is reasonable for their team size and use case.
2. **Plan confusion** — most tools have 4–6 plans with overlapping features; most users are on the wrong one.
3. **No neutral comparison** — existing AI tool comparison sites are affiliate-driven or vendor-sponsored.
4. **Discount blindness** — companies like Credex sell AI credits at a discount, but potential buyers don't know they're overpaying in the first place.

### Core Workflows

1. **Audit workflow** — user fills form, receives instant results, no account needed.
2. **Lead capture workflow** — after seeing value, user optionally provides email; backend stores lead and sends confirmation email.
3. **Share workflow** — user copies a unique public URL and shares it; the public view strips identifying info.
4. **Consultation CTA workflow** — high-savings users are shown a prominent Credex booking prompt.

---

## 2. User Roles and Permissions

This is a **single-role, no-auth product**. There is no login, no dashboard, no admin panel in the public-facing MVP.

| Role | Description | Access |
|---|---|---|
| **Anonymous visitor** | Anyone arriving at the site cold | Landing page, spend form, results page |
| **Audit owner** | Anyone who completed an audit (identified by browser session / `auditId` in URL) | Full results page including email capture |
| **Referral viewer** | Anyone with a `/share/[auditId]` link | Public anonymized results view only |

**Permissions summary:**
- No page requires login.
- No page requires account creation.
- Email capture is entirely optional.
- The public share URL `/share/[auditId]` never exposes company name, email address, or role. It shows tool names, plan names, savings numbers, and the AI summary.
- There is no admin UI in the MVP.

---

## 3. Navigation Architecture

### 3.1 Route Map

```
/                          → Landing page
/audit                     → Spend input form
/results/[auditId]         → Private audit results (full, with email capture)
/share/[auditId]           → Public anonymized audit results (shareable)
/confirmed                 → Post-email-capture confirmation screen
/404                       → Not found
/500                       → Server error
```

All routes are **public**. There are no protected/authenticated routes in the MVP.

### 3.2 Top Navigation

The top navigation bar is **minimal and consistent** across all pages.

**Components:**
- Left: Logo / wordmark ("SpendScan" or chosen product name). Clicking it goes to `/`.
- Right (desktop): A single ghost button: "Run Your Own Audit" → links to `/audit`. Hidden on the `/audit` page itself.
- No hamburger menu, no links, no user avatar.

**Behavior on scroll:** The navbar is sticky. On scroll down it gains a subtle background blur / shadow to stay readable.

**Mobile:** Same layout. Logo left, CTA button right (collapses to icon on very small screens if needed).

### 3.3 Footer

Minimal footer present on Landing, Results, and Share pages. Not shown on the `/audit` form (reduce distraction).

**Footer contents:**
- "Built for Credex · credex.rocks"
- "Privacy" (static page or modal — can be a modal in MVP)
- "How it works" anchor link → scrolls to the explainer section on the landing page

### 3.4 Breadcrumbs

Not used. The flow is intentionally linear. Breadcrumbs add no value in a 3-step funnel.

### 3.5 Mobile Navigation

No sidebar, no drawer. The top nav collapses gracefully. The entire product is designed as a single-column mobile-first experience.

---

## 4. Page-by-Page Specification

---

### 4.1 Landing Page — `/`

**Purpose:** Convert cold visitors from tweets, Hacker News, or blog posts into users who click through to the audit form.

**Who can access it:** Everyone.

---

#### Sections (top to bottom)

**Section 1: Hero**

- Headline: ≤10 words. Example: "Find out where your AI bills are bleeding money."
- Subheadline: ≤25 words. Plain language, specific to the ICP.
- Primary CTA button: e.g., "Audit my AI spend — free, no account needed" → navigates to `/audit`.
- Below CTA: Social proof line. Example: "Used by 200+ engineers this week" (mocked at launch, labeled as estimated).
- Hero visual: A mockup or illustration of the audit results card. Not a generic stock photo. Shows dollar savings prominently.

**Section 2: How It Works**

- 3-step horizontal (desktop) / vertical (mobile) explainer:
  1. "Enter your AI tools" — icon: form/list
  2. "Get your instant audit" — icon: chart/analysis
  3. "See where to save" — icon: dollar/checkmark
- Each step has a 1-sentence description.

**Section 3: What We Audit**

- Logo grid of supported tools: Cursor, GitHub Copilot, Claude, ChatGPT, Anthropic API, OpenAI API, Gemini, Windsurf/v0.
- Subtext: "Pricing verified weekly against official vendor pages."

**Section 4: Sample Audit Teaser**

- A static (non-interactive) mockup of a results card showing example savings.
- This is the "screenshot bait" — designed to look shareable.
- Small label: "Example output — not real data."

**Section 5: FAQ (5 items)**

Collapsed accordion by default.

1. Is this really free? / Do I need an account?
2. How do you know what the right plan is for me?
3. What is Credex and why does it appear in some audits?
4. Is my data stored anywhere?
5. How current is the pricing data?

**Section 6: Final CTA**

- Repeat of the primary CTA button.
- "Takes under 3 minutes. No signup required."

---

#### UI Components

| Component | Behavior |
|---|---|
| Primary CTA button | On click → navigate to `/audit` |
| FAQ accordion items | Click to expand/collapse. Only one open at a time. |
| Logo grid (tool logos) | Static display. No interaction. |
| Sample audit card | Static. "Example output" label clearly visible. |

#### Loading State

The landing page is server-rendered (SSR/SSG). No skeleton states needed. Renders instantly.

#### Empty States

No empty states on this page.

#### Responsive Behavior

- Hero: Stacks to single column below 768px. CTA button becomes full width.
- How It Works: 3 columns → 1 column on mobile.
- Logo grid: Wraps responsively.

---

### 4.2 Spend Input Form — `/audit`

**Purpose:** Collect the user's AI subscriptions accurately and completely, with as low friction as possible.

**Who can access it:** Everyone.

---

#### Page Layout

Single-column centered layout. Max width ~680px. No sidebar. Top nav without the "Run Your Own Audit" button (user is already here).

**Progress indicator:** A 2-step breadcrumb at the top: `① Enter your tools → ② See your audit`. Step 1 is active.

---

#### Global Form Fields (shown once, at top)

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| Team size | Number input | Yes | — | "How many people are on your team?" Whole numbers only. Min 1. |
| Primary use case | Single-select segmented control | Yes | — | Options: Coding / Writing / Data Analysis / Research / Mixed |

---

#### Tool Entry Section

**Initial state:** One tool row is shown. Empty. User has not selected a tool yet.

**Per-tool row structure:**

| Field | Type | Required | Notes |
|---|---|---|---|
| Tool name | Dropdown (searchable) | Yes | Options: Cursor, GitHub Copilot, Claude, ChatGPT, Anthropic API (direct), OpenAI API (direct), Gemini, Windsurf/v0. Each tool can only be added once. Already-added tools are greyed out in the dropdown. |
| Plan | Dropdown | Yes | Options populate dynamically based on selected tool. See plan lists below. |
| Number of seats | Number input | Conditional | Hidden for usage-based API tools (Anthropic API direct, OpenAI API direct). Shown for all subscription tools. Min 1. |
| Monthly spend (USD) | Number input (currency) | Yes | For subscription tools: pre-populated with `plan_price × seats` as a suggestion but user can override. For API tools: free-form entry only. Placeholder: "Your avg. monthly bill." |
| Remove tool | Icon button (×) | — | Removes this tool row. Shown only when there is more than 1 row. |

**Plan options per tool:**

- **Cursor:** Hobby (Free) / Pro ($20/user/mo) / Business ($40/user/mo) / Enterprise (custom)
- **GitHub Copilot:** Individual ($10/mo flat) / Business ($19/user/mo) / Enterprise ($39/user/mo)
- **Claude (Anthropic):** Free / Pro ($20/user/mo) / Max ($100/user/mo) / Team ($30/user/mo) / Enterprise (custom) / API direct (usage-based)
- **ChatGPT (OpenAI):** Plus ($20/user/mo) / Team ($30/user/mo) / Enterprise (custom) / API direct (usage-based)
- **Anthropic API direct:** No plan selector. Monthly spend only.
- **OpenAI API direct:** No plan selector. Monthly spend only.
- **Gemini (Google):** Pro ($19.99/mo) / Ultra ($29.99/mo) / API (usage-based)
- **Windsurf:** Free / Pro ($15/user/mo) / Teams ($35/user/mo) / Enterprise (custom)
  *(or v0 if chosen: Free / Pro ($20/mo) / Team ($30/user/mo))*

---

#### Running Total Bar

Sticky bar at the bottom of the viewport (above the submit button on mobile, to the right of the form on wide screens).

**Contents:**
- "Current monthly total: **$X,XXX**"
- "Current annual total: **$XX,XXX**"
- Updates live as the user changes any spend field.
- No animation — just instant rerender.

---

#### Add Tool Button

- Text: "+ Add another tool"
- Positioned below the last tool row.
- On click: Appends a new empty tool row below the existing ones.
- Disabled / hidden when all 8 supported tools have been added (edge case).

---

#### Submit Button

- Text: "Run my audit →"
- Full width on mobile.
- **Disabled state:** Button is disabled and grey if: team size is empty, use case is not selected, or any visible tool row has an incomplete required field.
- **Enabled state:** Active green/brand color when all fields are complete.

---

#### Form Persistence (localStorage)

- **On every field change:** The entire form state is serialized and saved to `localStorage` under the key `aisaa_form_state`.
- **On page load:** If `aisaa_form_state` exists in localStorage, the form is pre-populated with that data.
- **Persistence banner:** If pre-populated from storage, a dismissable inline notice appears at the top of the form: "We saved your previous answers. Click to clear and start fresh." Clicking "clear and start fresh" wipes localStorage and resets the form.
- **On successful submission:** localStorage key is cleared after the results page loads successfully.

---

#### Validation Behavior

Validation is **on-submit** (not on-blur) to reduce friction. On submit, if errors exist:

- The submit button shows a brief shake animation.
- Error messages appear inline below each invalid field in red.
- The page scrolls to the first error.

**Validation rules:**

| Field | Rule | Error Message |
|---|---|---|
| Team size | Required, integer ≥ 1 | "Enter your team size (minimum 1)" |
| Use case | Required | "Select your primary use case" |
| Tool name | Required per row | "Select a tool" |
| Plan | Required per row (except API-direct tools) | "Select a plan" |
| Seats | Required for non-API tools, integer ≥ 1 | "Enter number of seats (minimum 1)" |
| Monthly spend | Required, number > 0 | "Enter your monthly spend" |

---

#### Loading State (On Submit)

When the user clicks "Run my audit →" and all validation passes:

1. The submit button text changes to "Analyzing your stack…" with a spinner icon.
2. The button becomes disabled.
3. The form fields become read-only (visually dimmed).
4. No skeleton overlay — the form stays visible.
5. After the audit engine completes (client-side, near-instant) and the audit record is persisted to the backend, the user is redirected to `/results/[auditId]`.

**Failure during submission (backend save fails):**

- The form re-enables.
- A red toast notification appears: "Something went wrong saving your audit. Your answers are still here — try again."
- The button text resets to "Run my audit →".

---

#### Empty State (Fresh load, no localStorage)

The form shows one empty tool row with placeholder text in all fields. Team size and use case are blank.

---

#### Responsive Behavior

- Single column throughout.
- Tool rows stack fields vertically on mobile (tool / plan / seats / spend each takes full width).
- Running total bar becomes a sticky bottom bar on mobile.
- Segmented use-case control wraps to 2 rows on very narrow screens.

---

### 4.3 Audit Results Page — `/results/[auditId]`

**Purpose:** Show the user their complete audit results, surface the Credex CTA (if applicable), capture their email, and give them a share link.

**Who can access it:** Anyone with the link. The `auditId` is a UUID. No authentication gate. The "private" version includes all data including company name and role if submitted; the share URL at `/share/[auditId]` strips those fields.

---

#### URL Structure

`/results/abc123-def456-...`

The `auditId` is generated at form submission time (UUID v4). It is unique per audit run.

---

#### Section 1: Hero Block (above the fold)

**Layout:** Full-width card, high visual contrast.

**Contents:**
- "Your AI Spend Audit" — small label
- "You could save **$X,XXX / month**" — large bold headline. Dollar amount is the sum of all per-tool `savings_per_month` values.
- "That's **$XX,XXX per year**" — secondary line.
- If savings = $0: "Your AI spend looks optimized." (No false savings generated.)
- Small subtext: "Based on [N] tools · [use case] team of [team size]"
- Share button (top right of card): "Share this audit" — see Share Flow.

**Color coding of hero:**
- Savings > $500/mo: Green/teal hero background.
- Savings $100–$500/mo: Amber/yellow hero background.
- Savings < $100/mo or $0: Blue/neutral hero background.

---

#### Section 2: Per-Tool Breakdown

**Layout:** A vertical stack of cards, one per tool entered.

**Each card contains:**

| Element | Content |
|---|---|
| Tool logo + name | Top left of card |
| Status badge | Top right: `Optimal` (green) / `Overspending` (amber) / `Switch Recommended` (red) |
| Current spend | "Currently paying: **$XXX/mo**" |
| Recommended action | 1–2 sentences. Specific. e.g., "Downgrade from Business to Individual — Business adds SSO and audit logs which a 2-person team doesn't need." |
| Potential savings | Large: "Save **$XXX/mo**" — shown only if savings > 0 |
| Reason | 1-sentence rationale. e.g., "GitHub Copilot Individual costs $10/mo flat; Business costs $38/mo for 2 seats." |

**Card states:**

- `optimal` card: Green left border, "✓ Spending well" label, no savings shown.
- `overspending` card: Amber left border, savings amount shown in amber.
- `switch_recommended` card: Red left border, savings amount in red, alternative tool name mentioned.

**Interaction:** Cards are not expandable or clickable in MVP.

---

#### Section 3: AI-Generated Personalized Summary

**Layout:** Full-width card with subtle background, below the tool cards.

**Heading:** "Your Audit Summary"

**Content:** ~100 words of plain English generated by the Anthropic API. Example: "Your team of 8 is spending $1,840/month across five AI tools. The biggest opportunity is GitHub Copilot Business — at your team size, switching to Individual saves $152/month with no meaningful capability loss. For your primary use case (coding), Cursor Pro delivers comparable output to ChatGPT Team at roughly half the cost per seat. If you consolidate to Cursor + Claude Pro, your monthly bill drops to approximately $640, a 65% reduction."

**Loading state for AI summary:**
- While the API call is in-flight, the card shows a 3-line skeleton shimmer.
- Skeleton lines animate left-to-right.
- The rest of the page is already fully rendered (AI summary loads async, does not block page render).

**Fallback state (API failure):**
- The skeleton is replaced by a template-generated paragraph (see AI Summary Flow below).
- No error message shown to the user. The fallback looks like normal text.
- A small "Summary" label stays; no indication it's a fallback.

---

#### Section 4: Credex CTA (Conditional)

This section renders differently based on total savings amount.

**Tier A — Savings > $500/mo:**

Full-width prominent card. Brand-colored background.

- Headline: "You're leaving $[X,XXX] on the table every month."
- Body: 2 sentences explaining that Credex sells discounted AI credits from companies that overforecast.
- Primary CTA button: "Book a free Credex consultation →" — opens a booking link (Calendly or equivalent) in a new tab.
- Secondary link: "Learn more about how Credex works" → credex.rocks

**Tier B — Savings $100–$500/mo:**

Smaller card. Subdued styling.

- Headline: "Credex could stretch your AI budget further."
- Body: 1 sentence.
- CTA button: "See how Credex works →" → credex.rocks

**Tier C — Savings < $100/mo or already optimal:**

Inline message, not a full card.

- "You're spending well. We'll let you know when better options appear for your stack."
- Feeds directly into the email capture section below with copy: "Notify me of new optimizations."

---

#### Section 5: Email Capture

**Placement:** Below the Credex CTA. Never shown before the results.

**Layout:** Inline form within the results page. Not a modal.

**Heading (varies by tier):**
- Tier A: "Get your full audit report + Credex will reach out about saving you $[X,XXX]/mo"
- Tier B: "Get your audit report emailed to you"
- Tier C: "Get notified when new optimizations apply to your stack"

**Fields:**

| Field | Type | Required |
|---|---|---|
| Email address | Email input | Yes |
| Company name | Text input | No |
| Role | Text input (free-form) | No |
| Team size | Pre-populated from audit data | Read-only, shown for transparency |

**Honeypot field:** A visually hidden field (`aria-hidden`, `display:none`) named `website` or `url`. If submitted with a value, the submission is silently dropped server-side (abuse protection).

**Submit button:** "Send me the report" or "Notify me" depending on tier.

**Success state (after email capture):**
- The form is replaced by a green checkmark + message: "✓ Report sent to [email]. Check your inbox."
- The rest of the page remains visible.
- No redirect.

**Failure state:**
- Red inline error below the submit button: "Something went wrong. Please try again or email us at hello@credex.rocks"
- Button re-enables.

**Validation:**
- Email field: Must be valid email format. Error: "Enter a valid email address."
- Validated on submit.

**Rate limiting:**
- Per IP: Max 5 email submissions per hour.
- If rate limit hit: Inline message: "Too many submissions. Try again in an hour."

---

#### Section 6: Share Block

**Placement:** Below email capture, near the bottom of the page.

**Contents:**
- Heading: "Share this audit"
- Subtext: "Company name and email are stripped from the shared link."
- The public share URL displayed in a read-only text input: `https://[domain]/share/[auditId]`
- "Copy link" button: On click, copies URL to clipboard.
  - Button text changes to "✓ Copied!" for 2 seconds, then reverts.
  - Toast: "Link copied to clipboard."
- Optional: "Share on Twitter/X" button — opens tweet compose with pre-filled text: "Just audited our AI tool spend — saving $X,XXX/month by switching [Tool]. Free audit: [link]"

**Open Graph tags for the share URL:**
- `og:title`: "AI Spend Audit — Saving $X,XXX/mo"
- `og:description`: First 2 sentences of AI summary (sanitized, no PII)
- `og:image`: Dynamically generated image showing savings amount and tool logos
- `twitter:card`: `summary_large_image`

---

#### Loading State (Full Page)

When navigating from `/audit` to `/results/[auditId]`:

1. The page renders with all tool cards fully populated (audit engine is client-side, runs synchronously before render).
2. The hero savings number appears immediately.
3. The AI summary section shows a skeleton shimmer.
4. The email capture section is visible but below the fold.

If the auditId is invalid (not found in DB):
- Show a full-page error message: "We couldn't find this audit. It may have expired." + "Run a new audit →" button.

---

#### Responsive Behavior

- Tool cards stack full-width on mobile.
- Hero savings text scales down gracefully on narrow screens.
- Email capture form is single-column on mobile.
- Share URL input + copy button stack on mobile.

---

### 4.4 Shared Public Audit — `/share/[auditId]`

**Purpose:** A public, anonymized view of an audit result that can be freely shared. Stripping PII makes it safe to post on Twitter, Slack, etc.

**Who can access it:** Anyone with the link.

---

#### What's Shown (vs. Private Results Page)

| Data | Private `/results/[auditId]` | Public `/share/[auditId]` |
|---|---|---|
| Tool names | ✅ | ✅ |
| Plan names | ✅ | ✅ |
| Savings numbers | ✅ | ✅ |
| AI summary | ✅ | ✅ |
| Per-tool reasoning | ✅ | ✅ |
| Credex CTA | ✅ | ✅ (same as private) |
| Email capture form | ✅ | ✅ (shown to viewer — new lead opportunity) |
| Company name | ✅ (if provided) | ❌ Stripped |
| Email address | ✅ (if provided) | ❌ Stripped |
| Role | ✅ (if provided) | ❌ Stripped |

**Banner at top of public view:** A subtle info strip: "Viewing a shared AI spend audit. Identifying details have been removed. Run your own →"

**"Run your own audit" button** in the banner → `/audit`.

---

#### OG Image

The `/share/[auditId]` route generates a dynamic OG image at `/api/og/[auditId]` containing:
- Product logo / wordmark
- "AI Spend Audit"
- "Monthly savings: $X,XXX"
- Tool logos (small icons in a row)
- Brand colors

The OG image is generated server-side on first request, then cached.

---

#### Responsive Behavior

Identical to the private results page minus the hidden fields.

---

### 4.5 Email Confirmation — `/confirmed`

**Purpose:** A simple landing page after a user clicks the link in their confirmation email (optional — this can also just be a message on the results page). In MVP this is a minimal page.

**Contents:**
- "✓ You're confirmed."
- "We've saved your audit report. If your savings are significant, someone from Credex will reach out within 2 business days."
- "View your audit again →" → `/results/[auditId]` (auditId passed as query param)

---

### 4.6 404 Page

**Contents:**
- "Page not found."
- "This audit URL may have expired or the link is broken."
- "Run a new audit →" button → `/audit`

---

### 4.7 500 / Error Page

**Contents:**
- "Something went wrong on our end."
- "Your form data is saved in your browser — try refreshing."
- "If the problem persists, email us at hello@credex.rocks"
- "Try again →" button → `/`

---

## 5. Complete User Flows

---

### 5.1 Cold Visitor → Audit → Lead Capture Flow

This is the primary end-to-end flow. Every other flow is a branch or sub-flow of this one.

```
1. User arrives at "/" from a link (tweet, HN post, blog, word of mouth)
   └─ Landing page renders (SSG, instant)

2. User reads the hero, skims How It Works
   └─ Clicks "Audit my AI spend — free, no account needed"
   └─ Navigates to "/audit"

3. User fills in the form
   └─ Sets team size: e.g., 8
   └─ Sets use case: "Coding"
   └─ Selects tool: "GitHub Copilot" → Plan: "Business" → Seats: 8 → Spend: auto-suggested $152/mo
   └─ Clicks "+ Add another tool"
   └─ Selects tool: "ChatGPT" → Plan: "Team" → Seats: 8 → Spend: $240/mo
   └─ Sees running total update to $392/mo
   └─ [At every field change: localStorage is updated]

4. User clicks "Run my audit →"
   └─ Client-side validation passes
   └─ Button shows "Analyzing your stack…" + spinner
   └─ Audit engine runs synchronously (pure functions, <10ms)
   └─ Audit record saved to backend (POST /api/audits)
   └─ On success: redirect to "/results/[auditId]"

5. Results page renders
   └─ Hero: "You could save $232/month" (example)
   └─ Tool cards rendered with status badges
   └─ AI summary section shows skeleton shimmer
   └─ AI summary API call fires (async, non-blocking)

6. AI summary loads
   └─ Skeleton replaced with 100-word paragraph

7. User scrolls down
   └─ Sees Credex CTA (Tier A or B based on savings amount)
   └─ Sees email capture form

8. User fills in email (optional)
   └─ Clicks "Send me the report"
   └─ POST /api/leads
   └─ Form replaced with "✓ Report sent to user@company.com"
   └─ Transactional email fires (Resend/Postmark)

9. User clicks "Copy link" in Share block
   └─ URL copied to clipboard
   └─ Button shows "✓ Copied!" for 2s

10. [Optional] User clicks Twitter share button
    └─ Opens tweet compose in new tab with pre-filled copy
```

---

### 5.2 Form Persistence Flow (Page Reload)

```
1. User is on "/audit", has filled in 2 tools
   └─ Each field change has saved state to localStorage["aisaa_form_state"]

2. User accidentally closes the tab (or refreshes)

3. User reopens "/audit"
   └─ On mount: check localStorage for "aisaa_form_state"
   └─ State found: form pre-populates with previous values
   └─ Persistence banner appears: "We saved your previous answers. Click to clear."

4a. User dismisses the banner and continues
    └─ Banner hides. Form stays pre-populated.

4b. User clicks "clear and start fresh"
    └─ localStorage["aisaa_form_state"] deleted
    └─ Form resets to single empty tool row
    └─ Banner hides
```

---

### 5.3 Audit Submission Flow

```
User clicks "Run my audit →"
  │
  ├─ [Validation fails]
  │    └─ Button shakes
  │    └─ Error messages render inline below invalid fields
  │    └─ Page scrolls to first error
  │    └─ Button re-enables
  │
  └─ [Validation passes]
       └─ Button → "Analyzing your stack…" + spinner (disabled)
       └─ Form fields dimmed (read-only)
       └─ Audit engine runs synchronously (client-side pure functions)
       └─ Audit result object assembled:
            {
              auditId: uuid(),
              teamSize: N,
              useCase: "coding",
              tools: [...],
              totalMonthlySavings: N,
              totalAnnualSavings: N,
              createdAt: timestamp
            }
       └─ POST /api/audits — body: audit result object
            │
            ├─ [200 OK]
            │    └─ localStorage["aisaa_form_state"] cleared
            │    └─ router.push("/results/" + auditId)
            │
            └─ [4xx / 5xx / network error]
                 └─ Form re-enables
                 └─ Button resets to "Run my audit →"
                 └─ Toast: "Something went wrong saving your audit. Your answers are still here — try again."
                 └─ localStorage state retained (user does not lose their data)
```

---

### 5.4 AI Summary Generation Flow

```
Results page mounts at "/results/[auditId]"
  └─ Audit data loaded (from route params or server props)
  └─ Hero and tool cards render immediately
  └─ AI summary card renders with skeleton shimmer

  Async: POST /api/summary — body: { auditId, tools, useCase, teamSize, totalSavings }
    │
    ├─ [API responds < 10s with 200]
    │    └─ Skeleton replaced with generated ~100-word paragraph
    │    └─ Summary text fades in smoothly
    │
    ├─ [API timeout > 10s]
    │    └─ Request aborted client-side
    │    └─ Fallback template paragraph generated client-side from audit data
    │    └─ Skeleton replaced with fallback (indistinguishable from generated)
    │
    └─ [API returns 4xx / 5xx]
         └─ Same fallback behavior as timeout
         └─ Error logged to console (dev) / error tracking service (prod)
         └─ No error shown to user
```

**Fallback template example:**
"Your team of [N] is currently spending $[X]/month across [N] AI tools. Based on your [use case] workflow, the most impactful change would be [top recommendation]. Switching to the recommended plans would reduce your monthly spend to approximately $[Y], saving $[savings]/month or $[annual savings]/year. Your current setup is [X% above / at / below] the typical spend for [use case] teams of your size."

---

### 5.5 Email Capture Flow

```
User is on "/results/[auditId]" (or "/share/[auditId]")
  └─ Scrolls to email capture section
  └─ Fills in email (required), optionally company name and role

User clicks submit button ("Send me the report")
  └─ Client-side validation: email format check
        │
        ├─ [Invalid email]
        │    └─ Inline error: "Enter a valid email address."
        │
        └─ [Valid email]
             └─ Button → spinner + "Sending…" (disabled)
             └─ POST /api/leads — body: { auditId, email, companyName?, role?, teamSize }
                  │
                  ├─ [200 OK]
                  │    └─ Form replaced with: "✓ Report sent to [email]. Check your inbox."
                  │    └─ Transactional email sent via Resend/Postmark:
                  │         Subject: "Your AI Spend Audit — $[savings]/mo potential savings"
                  │         Body: Summary of results + link back to audit + Credex CTA if Tier A
                  │
                  ├─ [429 Rate Limited]
                  │    └─ Inline message: "Too many submissions. Try again in an hour."
                  │    └─ Button re-enables
                  │
                  └─ [5xx / network error]
                       └─ Button re-enables
                       └─ Error: "Something went wrong. Please try again."
```

---

### 5.6 Share Flow

```
User on "/results/[auditId]" clicks "Share this audit"
  └─ Public URL constructed: "https://[domain]/share/[auditId]"
  └─ URL shown in read-only input field
  └─ User clicks "Copy link"
        └─ navigator.clipboard.writeText(url) called
              │
              ├─ [Clipboard API available and permitted]
              │    └─ Button text: "✓ Copied!" for 2 seconds → reverts to "Copy link"
              │    └─ Toast notification: "Link copied to clipboard."
              │
              └─ [Clipboard API unavailable (rare)]
                   └─ URL input text selected automatically
                   └─ Toast: "Select the URL above to copy it manually."

[Optional] User clicks "Share on Twitter/X"
  └─ window.open() → Twitter intent URL
  └─ Pre-filled tweet: "Just ran a free AI spend audit — found $[savings]/mo in potential savings. Try it: [url] via @credex_rocks"
  └─ Opens in new tab
```

**Referral viewer flow (someone who received the share link):**
```
Viewer clicks share link → lands on "/share/[auditId]"
  └─ Public results page renders
  └─ Top banner: "Viewing a shared audit. Identifying details removed."
  └─ "Run your own audit →" button visible
  └─ Email capture form shown (new lead opportunity — this is the referral loop)
  └─ If viewer fills in email: their lead is stored with source = "referral_share"
```

---

### 5.7 High-Savings CTA Flow (Savings > $500/mo)

```
Results page renders for user with $800/mo potential savings
  └─ Hero: green background, large "$800/mo" savings number
  └─ Credex CTA card (Tier A) visible:
       "You're leaving $9,600 on the table every year."
       [Book a free Credex consultation →]

User clicks "Book a free Credex consultation →"
  └─ External booking link (Calendly/equivalent) opens in NEW TAB
  └─ User stays on the results page
  └─ No redirect, no state change on the results page

[If user has not yet submitted email]
  └─ Email capture CTA below: "Get your full audit report + Credex will reach out"
  └─ Captures lead before consultation booking if user prefers not to use Calendly
```

---

### 5.8 Already-Optimal Flow (Savings = $0 or < $100/mo)

```
Results page renders for user with $45/mo or $0 potential savings
  └─ Hero: blue/neutral background
  └─ "Your AI spend looks optimized." or "Minor optimization available: $45/mo"
  └─ All tool cards show green "✓ Optimal" badges (or 1 amber if there's a minor saving)
  └─ AI summary acknowledges good spending hygiene

  Instead of Credex Tier A/B card:
  └─ Inline message: "You're spending well. We'll notify you when better options emerge."
  └─ Email capture CTA: "Notify me of new optimizations"
       └─ After email submit: stored in backend with tag "notify_optimizations"
       └─ Confirmation: "✓ We'll be in touch when your stack has new options."
```

---

## 6. Component Behavior Library

This section defines the exact behavior of reusable UI components used throughout the app.

---

### 6.1 Toast Notifications

- Rendered in a fixed top-right corner container (bottom-center on mobile).
- Auto-dismiss after 4 seconds.
- Can be manually dismissed (× button).
- Stack vertically if multiple toasts queue.
- Types: `success` (green), `error` (red), `info` (blue).

| Trigger | Type | Message |
|---|---|---|
| Link copied | info | "Link copied to clipboard." |
| Email submitted | success | "Report on its way to your inbox." |
| Backend save failure | error | "Something went wrong saving your audit. Try again." |
| Rate limit hit | error | "Too many submissions. Try again in an hour." |

---

### 6.2 Skeleton Loaders

Used only for the AI summary section.

- 3 horizontal skeleton bars, varying widths (100%, 90%, 60%).
- Animated shimmer: left-to-right gradient sweep, 1.5s loop.
- Replace with content on API response, or fallback after 10s timeout.

---

### 6.3 Tool Logo Components

- Each supported tool has a 32×32px logo asset.
- Used in the per-tool breakdown cards and in the OG image.
- Accessible: each logo has an `alt` attribute with the tool name.

---

### 6.4 Segmented Control (Use Case Selector)

- 5 options: Coding / Writing / Data Analysis / Research / Mixed.
- Single selection only.
- Selected option has a filled background (brand color).
- Unselected options have a ghost/outline style.
- On mobile: wraps to 2 rows (3 on top, 2 on bottom) or scrolls horizontally.

---

### 6.5 Copy-to-Clipboard Button

- Initial state: Copy icon + "Copy link" text.
- On click: Calls `navigator.clipboard.writeText()`.
- On success: Checkmark icon + "✓ Copied!" — reverts after 2 seconds.
- On failure: Shows toast with fallback instruction.

---

### 6.6 Running Total Bar

- Renders below the tool entry section on desktop (sticky side panel).
- On mobile: sticky bottom bar above the submit button.
- Shows `$X,XXX / month` and `$XX,XXX / year`.
- Updates on every `onChange` event for any spend field.
- Calculation: `sum of all tool rows' monthly_spend values`.
- Displays `$0 / month` if no spend entered yet.

---

### 6.7 Status Badges

Used on audit result tool cards.

| Status | Badge Style | Icon |
|---|---|---|
| `optimal` | Green background, green text | ✓ checkmark |
| `overspending` | Amber background, amber text | ⚠ warning triangle |
| `switch_recommended` | Red background, red text | → arrow / swap icon |

---

## 7. State Management Map

This section describes what lives where in the application's state.

| State | Storage Location | Lifetime | Notes |
|---|---|---|---|
| Form field values | localStorage `aisaa_form_state` | Persistent across reloads | Cleared on successful submission |
| Audit result | Server DB (Supabase) | Permanent | Keyed by `auditId` (UUID) |
| AI summary text | Fetched on results page mount | Session (not persisted) | Falls back to template on failure |
| Lead email | Server DB | Permanent | Linked to `auditId` |
| Share URL | Derived from `auditId` | Permanent (as long as auditId exists in DB) | No separate storage |
| Toast queue | React state (in-memory) | Component lifetime | No persistence needed |
| Copy button state | React local state | 2s timeout then reset | No persistence needed |

---

## 8. Error and Edge Case Handling

| Scenario | What Happens |
|---|---|
| User submits form with 0 seats for a per-seat tool | Validation error: "Enter number of seats (minimum 1)" |
| User navigates to `/results/nonexistent-id` | 404-style message: "Audit not found. It may have expired." + "Run a new audit" button |
| Anthropic API returns 429 (rate limit) during summary | Client treats as failure → fallback template rendered |
| Anthropic API key not set (local dev) | Summary section shows fallback with no error shown to user. Console warns. |
| User adds same tool twice | Second instance of that tool is greyed out in the tool dropdown and cannot be selected |
| API monthly spend > $5,000/mo | Audit engine flags as "Review usage" rather than a specific plan switch (recommendation: "Your API spend is unusually high for a team of [N]. Consider setting usage caps in your vendor dashboard.") |
| Form submitted with all tools marked as free/zero spend | Total monthly savings shows $0. Hero: "Your AI spend looks optimized (or minimal)." No false savings manufactured. |
| Clipboard API blocked by browser | Fallback: text input is selected; toast guides user to copy manually |
| Email already submitted for this auditId | Server returns 200 (idempotent). Client shows success message again. No duplicate email sent. |
| Backend completely unreachable (no internet) | Submission fails; toast shown; form data stays in localStorage; user can retry |
| localStorage not available (private browsing mode) | Form works normally; persistence silently disabled; no banner shown |

---

## 9. Responsive Behavior

### Breakpoints

| Breakpoint | Viewport Width | Layout |
|---|---|---|
| Mobile | < 640px | Single column, full-width |
| Tablet | 640–1024px | Single column, max-width container |
| Desktop | > 1024px | Single column centered (max ~720px form width; results max ~800px) |

### Per-Page Responsive Notes

**Landing Page:**
- Hero stacks (headline above CTA, no side-by-side).
- How It Works: 3-column → 1-column.
- FAQ accordion is full-width on all viewports.

**Audit Form:**
- Tool rows: On desktop, fields are in a single horizontal row (tool | plan | seats | spend | remove). On mobile, each field stacks vertically within the card.
- Running total: On desktop, floats sticky to the right of the form. On mobile, sticky bottom bar.
- Use case selector: On mobile, wraps to 2 rows.

**Results Page:**
- Hero savings number: font size scales down on mobile (e.g., 48px → 32px).
- Tool cards: Full width on all viewports.
- Credex CTA: Full width, stacks text + button vertically on mobile.
- Email capture: Single column on mobile.
- Share block: URL input and copy button stack on mobile.

**Share Page:**
- Identical to results page responsive behavior.
- Top banner is a single line on desktop, wraps gracefully on mobile.

### Accessibility Notes (Lighthouse ≥ 90 target)

- All interactive elements have visible focus rings.
- All images have descriptive `alt` attributes.
- Form fields have associated `<label>` elements (not just placeholders).
- Color is never the only differentiator — status badges also use icons and text.
- Toast notifications use `role="alert"` for screen reader announcement.
- Skeleton loaders use `aria-busy="true"` and `aria-label="Loading summary..."`.
- The copy-to-clipboard button has `aria-label="Copy share link to clipboard"`.
- The segmented use-case control is keyboard-navigable (arrow keys between options).
- Minimum contrast ratio of 4.5:1 for all body text.

---

*This document defines the complete user-facing behavior of the AI Spend Audit tool. Any behavior not specified here should default to the most intuitive, lowest-friction option consistent with the product's goal of converting cold visitors into qualified Credex leads.*
