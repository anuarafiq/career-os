import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function JobsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: jobs } = await supabase
    .from("jobs")
    .select("*, employer_profiles(company_name)")
    .eq("status", "open")
    .order("created_at", { ascending: false });

  return (
    <div className="px-8 py-8 max-w-3xl">
      <h1 className="font-heading text-3xl font-bold mb-1">Job Board</h1>
      <p className="text-muted-foreground text-sm mb-8">Open opportunities matched to your profile.</p>

      {(jobs ?? []).length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground text-sm">No open jobs yet — check back soon.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {jobs!.map((job) => {
            const employer = job.employer_profiles as { company_name: string } | null;
            return (
              <div key={job.id} className="bg-card border border-border rounded-lg p-4 hover:border-brand/40 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">{job.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {employer?.company_name ?? "Company"} · {job.location} · <span className="capitalize">{job.employment_type.replace("_", "-")}</span>
                    </p>
                  </div>
                  {(job.salary_min || job.salary_max) && (
                    <span className="text-brand tabular text-xs font-semibold shrink-0 ml-4">
                      {job.salary_min && job.salary_max
                        ? `RM ${(job.salary_min / 1000).toFixed(0)}k–${(job.salary_max / 1000).toFixed(0)}k`
                        : job.salary_min
                        ? `From RM ${(job.salary_min / 1000).toFixed(0)}k`
                        : `Up to RM ${(job.salary_max! / 1000).toFixed(0)}k`}
                    </span>
                  )}
                </div>
                {job.required_skills && job.required_skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {job.required_skills.slice(0, 5).map((skill: string) => (
                      <span key={skill} className="text-xs bg-secondary border border-border px-2 py-0.5 rounded-full text-muted-foreground">
                        {skill}
                      </span>
                    ))}
                    {job.required_skills.length > 5 && (
                      <span className="text-xs text-muted-foreground">+{job.required_skills.length - 5} more</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
