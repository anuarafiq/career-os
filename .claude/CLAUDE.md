# Career OS — Project Instructions

## Stack
Next.js 16.2.7 (App Router, Turbopack) + Supabase + Groq API (llama-3.3-70b-versatile via @ai-sdk/groq) + Tailwind CSS v4 + shadcn/ui + React Flow

Deadlines: Intent Form **15 June 2026** · Stage 2 build **26 July 2026**

See [ARCHITECTURE.md](ARCHITECTURE.md) for feature implementation notes.

## Documentation Rule
After completing any feature, update `.claude/ARCHITECTURE.md` under the relevant domain section before marking the task done. Add to `CLAUDE.md` only if there is a genuine gotcha - a non-obvious trap, broken convention, or decision that would surprise a fresh instance.

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

## Gotchas

- **`middleware.ts` renamed to `proxy.ts`** — Next.js 16 breaking change
- **Color token trap:** `--accent` in Tailwind/globals.css resolves to shadcn's dark muted surface, not the amber. Use `--brand` / `--brand-dim` / `--brand-subtle` for amber/gold.
- **Supabase generics removed** from client wrappers — use plain `createBrowserClient()`, cast with `as unknown as` where needed (TS bundler moduleResolution issue)
- **RLS trap:** if post-signup redirect to onboarding breaks, check `profiles` table has `SELECT` policy allowing `auth.uid() = id`
- **service_role grants:** Supabase service_role does not get table grants automatically when RLS is enabled — must `GRANT ... TO service_role` explicitly (see `supabase/migrations/003_service_role_grants.sql`)
- **`input[type="month"]` picker icon** styled via `::-webkit-calendar-picker-indicator` in `globals.css` — inverted + amber tint on hover
- **Demo requires migration 003** — `POST /api/demo` will fail without the service_role grants from that migration
