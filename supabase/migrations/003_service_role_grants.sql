-- Grant full access to service_role on all tables (needed for admin/seeding operations)
grant select, insert, update, delete on
  public.profiles,
  public.candidate_profiles,
  public.skills,
  public.candidate_skills,
  public.qualifications,
  public.work_experiences,
  public.portfolio_items,
  public.coach_sessions,
  public.employer_profiles,
  public.jobs,
  public.applications,
  public.talent_pools,
  public.career_nodes,
  public.career_edges,
  public.salary_data
to service_role;
