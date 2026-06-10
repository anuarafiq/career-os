-- Portfolio visibility + safe public read via a SECURITY DEFINER RPC.
--
-- Goal: serve the public portfolio page (/p/[candidateId]) without the service_role
-- admin client (which bypassed RLS entirely), AND without granting the anon role
-- table-level SELECT. A broad `grant select ... to anon` would expose Supabase's public
-- PostgREST endpoint (the anon key ships in the browser bundle), letting anyone bulk-
-- export every candidate's work history / PII in one call — defeating the UUID-only
-- access model. Instead, a definer function returns ONE portfolio by id, only if public.

-- Per-candidate public visibility. Default true preserves current public behavior.
alter table candidate_profiles
  add column is_public boolean not null default true;

-- Tighten finding #3: the old "employer read using (true)" let every authenticated user
-- read ALL candidate profiles. Gate it on is_public so opted-out candidates are hidden
-- from employer search too. (Applies to authenticated only — anon has no table grant.)
-- NOTE: a candidate who sets is_public = false also becomes invisible to employers they
-- applied to; add an applications-scoped policy later if that visibility is needed.
drop policy if exists "candidate_profiles: employer read" on candidate_profiles;
create policy "candidate_profiles: public read"
  on candidate_profiles for select using (is_public = true);

-- Sub-tables (qualifications, work_experiences, portfolio_items, candidate_skills) keep
-- their owner-only "<table>: own" policies — NO broad public-read policy and NO anon
-- grant. Non-owners reach this data ONLY through the definer RPC below, one id at a time.

-- Assemble a single candidate's full public portfolio. SECURITY DEFINER runs as the
-- function owner (bypasses RLS), but returns data ONLY when is_public is true, so the
-- visibility gate still holds. Returns null for private/missing candidates.
create or replace function get_public_portfolio(p_id uuid)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select case when cp.is_public then jsonb_build_object(
    'candidate', jsonb_build_object(
      'id', cp.id, 'name', cp.name, 'location', cp.location, 'bio', cp.bio,
      'github_url', cp.github_url, 'linkedin_url', cp.linkedin_url,
      'seeking', cp.seeking, 'job_title', cp.job_title, 'years_exp', cp.years_exp
    ),
    'qualifications', coalesce((
      select jsonb_agg(to_jsonb(q) order by q.start_date desc)
      from qualifications q where q.candidate_id = cp.id
    ), '[]'::jsonb),
    'work_experiences', coalesce((
      select jsonb_agg(to_jsonb(w) order by w.start_date desc)
      from work_experiences w where w.candidate_id = cp.id
    ), '[]'::jsonb),
    'skills', coalesce((
      select jsonb_agg(jsonb_build_object(
        'level', csk.level,
        'skills', jsonb_build_object('name', sk.name, 'category', sk.category)
      ))
      from candidate_skills csk
      join skills sk on sk.id = csk.skill_id
      where csk.candidate_id = cp.id
    ), '[]'::jsonb),
    'portfolio_items', coalesce((
      select jsonb_agg(to_jsonb(pi) order by pi.created_at desc)
      from portfolio_items pi where pi.candidate_id = cp.id
    ), '[]'::jsonb)
  ) else null end
  from candidate_profiles cp
  where cp.id = p_id;
$$;

-- Execute-only access. anon can call the function (one portfolio, public-gated) but has
-- NO table SELECT, so the PostgREST tables/* endpoints remain closed to it.
revoke all on function get_public_portfolio(uuid) from public;
grant execute on function get_public_portfolio(uuid) to anon, authenticated;
