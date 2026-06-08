# Career OS - TODO

> Talentbank Hackathon 2026 · Intent Form **15 Jun** · Stage 2 build **26 Jul**

## Blockers (nothing renders without these)

- [ ] **Supabase project** - create project, run both migrations, add `.env.local` (URL + anon key). App pages can't render until this exists.
- [x] **Groq API key** - switched from Anthropic to Groq (`llama-3.3-70b-versatile`). Add `GROQ_API_KEY` to env.
- [ ] **Demo / mock data mode** - seed a candidate + employer + jobs + applications so the full flow is demoable, ideally with one-click demo login. Needed for Intent Form UI review.

## Critical (core loop is broken without these)

- [ ] **Employer setup page** `/employer/setup` - form to create `employer_profiles` row (company name, industry, size, website). Dashboard links here but page doesn't exist.
- [ ] **Job posting UI** - form for employers to create jobs (title, location, salary range, skills, employment type). Insert into `jobs` table.
- [ ] **Apply button** - candidate-side apply action on the jobs page. Insert into `applications` table. Guard against duplicate applications.

## Important (referenced but not wired up)

- [ ] **Re-engage API route** `/api/ai/re-engage` - AI scans `talent_pools` against open `jobs`, returns fit suggestions + outreach drafts. Replace the `setTimeout` stub in `re-engage/page.tsx`.
- [ ] **Pipeline stage updates** - make the kanban interactive. Card action updates `application.status` via server action / API route. Supabase realtime optional.
- [ ] **Talent pool add** - "Save to pool" button on employer search results. Insert into `talent_pools` with `source: 'scouted'`.
- [ ] **Candidate application tracking** - candidates have no view of jobs they applied to or what stage they're at. Add a "My applications" view.

## AI features (high-impact demo, infra already exists)

- [ ] **Resume upload → auto-fill profile** - upload/paste a CV, Claude extracts structured data into the onboarding fields (name, quals, work, skills). Biggest onboarding UX win. Uses `document_url` storage column that already exists.
- [ ] **Skill-gap analysis** - given `current_role` + target node, surface the `skill_gaps` already stored on `career_edges` as "here's your gap to Senior SWE" + an AI learning roadmap.
- [ ] **Job fit score (candidate side)** - reuse `/api/ai/match` logic in reverse so each job on the board shows a fit % and "why you fit" for the logged-in candidate.
- [ ] **AI application note** - generate a tailored cover note at apply-time from candidate profile + job description.
- [ ] **AI job description writer (employer)** - employer pastes rough notes, Claude returns a polished JD for the posting form.
- [ ] **Personalized path highlighting** - in the career graph, highlight the recommended route from `current_role` to `seeking` with cumulative salary delta + time-to-reach.

## Platform essentials

- [ ] **Job board search + filters** - filter by location, salary band, skills, employment type. Currently shows an unfiltered list.
- [ ] **Saved jobs / bookmarks** - let candidates bookmark jobs to revisit.
- [ ] **Employer pipeline analytics** - conversion funnel across stages, time-in-stage. Trading-terminal aesthetic fits the brand.
- [ ] **File upload for qualifications** - `document_url` column exists but no upload flow (Supabase Storage).

## Polish + completeness

- [ ] **Profile editing** - post-onboarding edit flows for bio, links, skills, qualifications, work experience. Currently read-only after onboarding.
- [ ] **Portfolio item CRUD** - add/edit/delete `portfolio_items`. Page renders them but nothing populates them.
- [ ] **Coach session persistence** - read/write `coach_sessions` so conversations survive reloads. Table exists, route never touches it.
- [ ] **Public portfolio page** - shareable no-auth URL (e.g. `/p/[candidateId]`). Landing copy promises this.
- [ ] **Auth profile creation fix** - move the post-signup `profiles` insert into a Supabase DB trigger / server action so a dropped connection doesn't strand the user.
- [ ] **Landing page demo flow** - tighten the path a judge walks through for submission.
