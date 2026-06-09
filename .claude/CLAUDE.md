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
- Certificates feature added (`app/(candidate)/certificates/`). Migration `004_credential_url.sql` adds `credential_url text` to `qualifications`. Coursera URL extractor at `/api/certificates/coursera` (server-side fetch + OG tag parse, SSRF-guarded). Skill auto-suggest at `/api/certificates/skills-suggest` (Groq, up to 6 skills). Portfolio page splits Education and Certificates into separate sections; certs with `credential_url` show Coursera badge + Verify link + Recent badge (if earned within 90 days). Career path tie-in: after adding a cert, shows which career roles the suggested skills move the candidate toward (uses `career_edges.skill_gaps`).
- Job posting UI at `app/(employer)/employer/jobs/new/page.tsx` — client-side form, inserts into `jobs` table. Jobs list at `app/(employer)/employer/jobs/page.tsx`. "Post a job" button added to employer dashboard. Jobs nav item added to `EmployerSidebar.tsx`.
- Signup redirect: after account creation, employers go to `/employer/dashboard`, candidates go to `/onboarding` — avoids employers landing on candidate onboarding flow. Fix in `app/(auth)/signup/page.tsx`.
- Apply button at `app/(candidate)/jobs/ApplyButton.tsx` — client component. `jobs/page.tsx` (server) pre-fetches candidate profile + existing applications to hydrate `initialApplied` state. Insert guarded against `23505` unique violation. Color token gotcha: `--accent` in Tailwind/globals.css resolves to the dark muted surface (shadcn convention) — use `--brand` / `--brand-dim` / `--brand-subtle` for the amber/gold color.
- Candidate profile edit at `app/(candidate)/profile/edit/` — server page fetches `candidate_profiles`, passes to `ProfileEditForm` (client). Does `UPDATE` on `candidate_profiles`. "Profile" nav item (◓) added to `CandidateSidebar` between Portfolio and Certificates.
- Employer profile edit at `app/(employer)/employer/profile/` — server page fetches `employer_profiles`, redirects to `/employer/setup` if none exists. `EmployerProfileForm` (client) does `UPDATE` on `employer_profiles`. "Company Profile" nav item (◓) added to `EmployerSidebar` between Dashboard and Jobs.
- Re-engage API route at `app/api/ai/re-engage/route.ts` — POST, employer auth required. Fetches employer's open jobs + talent pool candidates (with skills), sends to Groq, returns up to 5 `ReEngageSuggestion[]` (`candidateId`, `name`, `jobTitle`, `fitNote`, `outreachDraft`). Returns `{ suggestions: [] }` if pool or jobs are empty. Demo route (`app/api/demo/route.ts`) calls `linkDemoPool()` on every login (idempotent upsert) to cross-link demo candidate into demo employer's talent pool regardless of seeding order.
- Resume auto-fill at `/onboarding` — pre-screen (`showImport` state, default `true`) renders before the wizard. Candidate pastes CV text; `POST /api/resumes/parse` calls Groq (`generateText`, maxOutputTokens 2048) and returns structured JSON (name, location, bio, github_url, linkedin_url, seeking, job_title, years_exp, qualifications[], work_experiences[], skills[]). Client merges response into all wizard state vars; skills matched case-insensitively against `allSkills` and pre-selected at "mid" level. "Skip, fill manually" bypasses import. Input capped at 20,000 chars. Double-parse fallback with regex `/\{[\s\S]*\}/`.
- Talent pool "Save to pool" button at `app/(employer)/employer/search/SaveToPoolButton.tsx` — client component on the smart search page. On mount, `page.tsx` fetches employer_id + existing `talent_pools` entries via browser Supabase client (`useEffect`). Each result card renders `SaveToPoolButton` (only when employerId loaded). Inserts with `source: 'scouted'`; handles `23505` unique violation as already-saved. Saved state shows "Saved ✓" in `--success` color.
- Pipeline stage updates at `app/(employer)/employer/pipeline/` — `page.tsx` stays a server component (data fetch), passes serialized `AppRow[]` + `JobRow[]` to `PipelineBoard.tsx` (client component). Board holds optimistic local state; moves update `applications.status` via Supabase browser client `.update()`. Cards have ← / → chevron buttons to step through `["applied", "reviewed", "shortlisted", "offered"]` and a danger-colored ✕ to reject. Rejected cards hide from main columns and appear in a collapsible section below with a "Restore →" button. `loadingId` state disables buttons during in-flight updates; errors revert state and show inline "Update failed".
- Candidate application tracking at `app/(candidate)/applications/page.tsx` — pure server component. Fetches `applications` with nested `jobs(title, location, employment_type, employer_profiles(company_name))` ordered by `applied_at` desc. Status badge colors: applied=brand, reviewed=muted, shortlisted=success/10, offered=success/20, rejected=destructive/10. Date shown as relative (Intl.RelativeTimeFormat) falling back to absolute for >7 days. Empty state links to /jobs. "My Applications" nav item (◫) added to `CandidateSidebar` after Jobs.
- Landing page judge demo flow at `app/page.tsx` — demo buttons elevated to primary CTAs (amber-filled `bg-primary`); signup links demoted to inline text below. New "2-minute walkthrough" section (between hero and feature grid) renders two side-by-side cards (Candidate / Employer) with 4 numbered steps each guiding a judge through key features. `components/DemoLogin.tsx` restyled: lead-in changed to "One-click demo — no account needed", scroll nudge added. Step data arrays (`candidateSteps`, `employerSteps`) appended at bottom of `page.tsx`.
