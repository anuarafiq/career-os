# Career OS — Project Instructions

## Project Overview
Talentbank Tech Hackathon 2026. Theme: "Career OS" — a career navigation platform for Asia.
Two-sided marketplace: candidates (interns + job seekers) and employers.

**Intent Form deadline: 15 June 2026**
**Stage 2 build deadline: 26 July 2026**

Stack: Next.js 15 (App Router) + Supabase + Claude API (claude-sonnet-4-6) + Tailwind CSS v4 + shadcn/ui + React Flow

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
