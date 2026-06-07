import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const STAGES = ["applied", "reviewed", "shortlisted", "offered", "rejected"] as const;

export default async function PipelinePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", user.id).single();
  const { data: employer } = await supabase.from("employer_profiles").select("id").eq("profile_id", profile?.id ?? "").single();

  if (!employer) redirect("/employer/dashboard");

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, title, status")
    .eq("employer_id", employer.id)
    .eq("status", "open");

  const { data: applications } = await supabase
    .from("applications")
    .select("id, status, job_id, candidate_profiles(name, current_role, location)")
    .in("job_id", (jobs ?? []).map((j) => j.id));

  const byStage = STAGES.reduce<Record<string, typeof applications>>((acc, stage) => {
    acc[stage] = (applications ?? []).filter((a) => a.status === stage);
    return acc;
  }, {} as Record<string, typeof applications>);

  return (
    <div className="px-8 py-8">
      <h1 className="font-heading text-3xl font-bold mb-1">Pipeline</h1>
      <p className="text-muted-foreground text-sm mb-8">
        {(applications ?? []).length} application{(applications ?? []).length !== 1 ? "s" : ""} across {(jobs ?? []).length} open role{(jobs ?? []).length !== 1 ? "s" : ""}
      </p>

      {(applications ?? []).length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground text-sm">No applications yet — candidates will appear here once they apply.</p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.filter((s) => s !== "rejected").map((stage) => (
            <div key={stage} className="w-64 shrink-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground capitalize">{stage}</h3>
                <span className="text-xs tabular text-muted-foreground">{(byStage[stage] ?? []).length}</span>
              </div>
              <div className="flex flex-col gap-2">
                {(byStage[stage] ?? []).map((app) => {
                  const candidate = (app.candidate_profiles as unknown) as { name: string; current_role: string | null; location: string | null } | null;
                  const job = (jobs ?? []).find((j) => j.id === app.job_id);
                  return (
                    <div key={app.id} className="bg-card border border-border rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-6 h-6 rounded-full bg-brand-subtle flex items-center justify-center text-brand text-xs font-bold shrink-0">
                          {candidate?.name.charAt(0).toUpperCase() ?? "?"}
                        </div>
                        <p className="text-sm font-medium text-foreground">{candidate?.name ?? "Unknown"}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{candidate?.current_role ?? "—"}</p>
                      {job && <p className="text-xs text-brand mt-1">{job.title}</p>}
                    </div>
                  );
                })}
                {(byStage[stage] ?? []).length === 0 && (
                  <div className="border border-dashed border-border rounded-lg p-4 text-center">
                    <p className="text-xs text-muted-foreground">Empty</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
