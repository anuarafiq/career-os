# Career OS — Project Instructions

## Stack
Next.js 16.2.7 (App Router, Turbopack) + Supabase + Groq API (llama-3.3-70b-versatile via @ai-sdk/groq) + Tailwind CSS v4 + shadcn/ui + React Flow

Deadlines: Intent Form **15 June 2026** · Stage 2 build **26 July 2026**

---

## Design

Dark mode. Amber/gold accent on deep navy-black. Salary/metric numbers feel like a trading terminal.

Typography: **Bricolage Grotesque** (headings) + **Geist Sans** (body). Tabular-nums for all salary/numeric data.

**Hard bans:** no side-stripe card borders, no gradient text.

### Color Tokens
```css
--bg-base:        oklch(0.13 0.012 258);
--bg-surface:     oklch(0.17 0.012 258);
--bg-elevated:    oklch(0.21 0.013 258);
--border-subtle:  oklch(0.26 0.014 258);
--border-strong:  oklch(0.35 0.016 258);
--text-primary:   oklch(0.94 0.006 258);
--text-secondary: oklch(0.62 0.012 258);
--text-muted:     oklch(0.44 0.010 258);
--accent:         oklch(0.82 0.14 72);
--accent-dim:     oklch(0.68 0.11 72);
--accent-subtle:  oklch(0.82 0.14 72 / 0.12);
--success:        oklch(0.76 0.14 148);
--danger:         oklch(0.66 0.18 22);
```

### Typography Scale
Scale: display (clamp 2.5–4rem), h1 (2rem), h2 (1.5rem), h3 (1.125rem), base (1rem), sm (0.875rem), xs (0.75rem).
Line heights: tight 1.2 (headings), body 1.6 (dark bg add 0.05), ui 1.4.

---

## Known Issues / Decisions

- `middleware.ts` renamed to `proxy.ts` — Next.js 16 breaking change
- Supabase Database generics removed from client wrappers — use plain `createBrowserClient()`, cast with `as unknown as` where needed (TS bundler moduleResolution issue)
- `proxy.ts` has early return guard when env vars are missing (landing page works without Supabase)
- `useSearchParams()` in signup page wrapped in Suspense boundary — Next.js 16 requirement
- `input[type="month"]` picker icon styled via `::-webkit-calendar-picker-indicator` in `globals.css` — inverted + amber tint on hover
- Post-signup RLS trap: if redirect to onboarding breaks after auth, check that `profiles` table has `SELECT` policy allowing `auth.uid() = id`
- Supabase service_role does not get table grants automatically when RLS is enabled — must `GRANT ... TO service_role` explicitly (see `supabase/migrations/003_service_role_grants.sql`)
- Admin client at `lib/supabase/admin.ts` — uses service role key, bypasses RLS, server-only
- Demo login: `POST /api/demo` seeds a full demo account on first call (idempotent). Landing page has one-click buttons via `components/DemoLogin.tsx`. Demo candidate: "Aishah Rahman" (UTM CS, Grab intern, 5 skills, 2 portfolio projects). Demo employer: "TechCorp Malaysia" (3 open jobs). Requires migration 003 grants to work.
- AI provider switched from Anthropic to Groq (`@ai-sdk/groq`). Client in `lib/claude/client.ts` exports `groq` + `MODEL`. Both AI routes use Vercel AI SDK `streamText`/`generateText`. Requires `GROQ_API_KEY` in env.
- Coach route (`app/api/ai/coach/route.ts`) caps `maxOutputTokens` at 512 and applies a 10-message sliding window (`messages.slice(-10)`) to bound input token cost per request.
- `react-markdown` added to `CoachChat.tsx` for rendering structured coach responses (bullets, bold, code). User messages render as plain text.
- Employer setup page at `app/(employer)/employer/setup/page.tsx` — single-step form, inserts into `employer_profiles`. Handles Postgres `23505` unique violation by redirecting to dashboard (profile already exists case).
