# Career OS — Project Instructions

## Project Overview
Talentbank Tech Hackathon 2026. Theme: "Career OS" — a career navigation platform for Asia.
Two-sided marketplace: candidates (interns + job seekers) and employers.

**Intent Form deadline: 15 June 2026**
**Stage 2 build deadline: 26 July 2026**

Stack: Next.js 16.2.7 (App Router, Turbopack) + Supabase + Claude API (claude-sonnet-4-6) + Tailwind CSS v4 + shadcn/ui + React Flow

---

## Design Context

### Users
Ambitious, goal-oriented — fresh graduates, career changers, working professionals making concrete career decisions. Impatient with fluff, reward clarity and real data. Secondary: employers who are busy and need density and filtering.

### Brand Personality
Precise, driven, sharp. LinkedIn-meets-design-studio. Serious but not cold. No hype, no motivational filler.

### Aesthetic Direction
Dark mode. Deep navy-black (`oklch(0.13 0.012 258)`). Amber/gold accent (`oklch(0.82 0.14 72)`) — conveys ambition, memorable against dark surfaces.

Typography: **Bricolage Grotesque** (headings) + **Geist Sans** (body). Tabular-nums for all salary/numeric data.

The one memorable thing: amber numbers on dark surfaces — salary stats and career metrics that feel like a trading terminal.

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
Headings: Bricolage Grotesque. Body/UI: Geist Sans.
Scale: display (clamp 2.5–4rem), h1 (2rem), h2 (1.5rem), h3 (1.125rem), base (1rem), sm (0.875rem), xs (0.75rem).
Line heights: tight 1.2 (headings), body 1.6 (dark bg add 0.05), ui 1.4.

### Spacing (4pt scale)
`--space-1: 4px` through `--space-24: 96px`

### Design Principles
1. Data first, decoration second
2. Density with breathing room — editorial, not cluttered
3. Earned hierarchy — not everything is a card
4. Purposeful dark — the theme signals a serious tool
5. No false warmth — honesty over decorative cheerfulness

### Component Rules
- Left sidebar nav (not top nav)
- Cards: flat-bordered, no drop shadow; use sparingly
- Buttons: amber fill (primary), outlined (secondary), text (ghost)
- Onboarding: full-screen stepped layout, one decision per screen
- Empty states: show what the user gets when filled — no generic "nothing here"
- No side-stripe card borders, no gradient text (absolute bans)

---

## Current State (as of 8 June 2026)

### What's built
- Auth: signup (candidate/employer role selector), login, Supabase callback
- Candidate onboarding: 5-step (basic info → intern/job seeker → qualifications → work experience → skills)
- Career Path Navigator: React Flow graph, 29 APAC career nodes, salary/transition/skill-gap detail panel
- AI Career Coach: streaming Claude chat, profile context injected, starter prompts
- Fair Pay Engine: P25/P50/P75 benchmarks by role/location/experience band
- Living Portfolio: auto-generated from profile data
- Jobs board: reads open jobs from DB
- Employer side: Smart Talent Matching (Claude ranks candidates vs JD), Pipeline kanban, Re-Engagement shell
- DB schema: full Postgres + RLS in `supabase/migrations/001_initial_schema.sql`
- Seed data: 29 career nodes, ~25 career edges, 27 salary benchmarks in `supabase/migrations/002_seed_data.sql`
- Demo login: one-click candidate/employer demo on landing page (`components/DemoLogin.tsx`), seeded via `POST /api/demo`; demo candidate is "Aishah Rahman" (UTM CS student, Grab intern, 5 skills, 2 portfolio projects); demo employer is "TechCorp Malaysia" (3 open jobs)

### Infrastructure
- Supabase project live — `.env.local` populated with URL + anon key + service role key
- Anthropic API key configured in `.env.local` — AI coach and talent match are live
- `supabase/migrations/003_service_role_grants.sql` — grants SELECT/INSERT/UPDATE/DELETE on all public tables to `service_role`; must be run in Supabase SQL editor when setting up a new project (Supabase does not grant service_role table access by default when RLS is enabled)
- Admin Supabase client at `lib/supabase/admin.ts` — uses service role key, bypasses RLS, for server-only use

### What's NOT done yet
- Employer onboarding (`/employer/setup`) not built — employer dashboard redirects there but the route doesn't exist
- Re-engagement API route is a stub (TODO comment, returns empty; UI shell only)
- No file upload UI for qualification documents (`document_url` column exists, upload flow not built)
- No public shareable portfolio URL (route not created)
- No job posting UI for employers

### Next priorities (for Intent Form by 15 June)
1. Employer onboarding — build `/employer/setup` route (company name form → `employer_profiles` insert); employer dashboard already redirects there
2. Demo flow walkthrough — verify end-to-end for both demo accounts: candidate (dashboard → explore → coach → pay) and employer (dashboard → search → pipeline)

### Stage 2 backlog (by 26 July)
- Re-engagement API route — replace stub with real logic (surface past applicants matching new JDs)
- Public shareable portfolio URL — create a `/p/[slug]` or `/portfolio/[id]` public route
- Job posting UI for employers — form to create/manage open roles
- Qualification document upload — `document_url` column exists, upload flow not built

### Known issues / decisions
- `middleware.ts` renamed to `proxy.ts` (Next.js 16 breaking change)
- Supabase Database generics removed from client wrappers (use plain `createBrowserClient()`) due to TS resolution issue with bundler moduleResolution — cast with `as unknown as` where needed
- `proxy.ts` has early return guard when env vars are missing (so landing page works without Supabase)
- `useSearchParams()` in signup page wrapped in Suspense boundary (Next.js 16 requirement)
- Route groups: `(candidate)` routes are `/dashboard`, `/explore`, `/coach`, `/pay`, `/portfolio`, `/jobs`, `/onboarding`; employer routes are `/employer/dashboard`, `/employer/search`, `/employer/pipeline`, `/employer/re-engage`
- `input[type="month"]` calendar picker icon styled via `::-webkit-calendar-picker-indicator` in `globals.css` — inverted + amber tint on hover to match dark theme
- Post-signup redirect to onboarding was broken — root cause was RLS policies on the `profiles` table blocking reads after auth; fixed via Supabase dashboard. If this recurs, check that the `profiles` table has a SELECT policy allowing `auth.uid() = id`
- Supabase service_role does not automatically get table-level grants when RLS is enabled — must explicitly `GRANT ... TO service_role` (see migration 003)
