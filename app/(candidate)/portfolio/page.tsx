import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function PortfolioPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", user.id).single();
  const { data: candidate } = await supabase
    .from("candidate_profiles")
    .select("id, name, location, bio, github_url, linkedin_url, seeking, current_role, years_exp")
    .eq("profile_id", profile?.id ?? "")
    .single();

  if (!candidate) redirect("/onboarding");

  const [{ data: quals }, { data: work }, { data: skills }, { data: portfolio }] = await Promise.all([
    supabase.from("qualifications").select("*").eq("candidate_id", candidate.id).order("start_date", { ascending: false }),
    supabase.from("work_experiences").select("*").eq("candidate_id", candidate.id).order("start_date", { ascending: false }),
    supabase.from("candidate_skills").select("level, skills(name, category)").eq("candidate_id", candidate.id),
    supabase.from("portfolio_items").select("*").eq("candidate_id", candidate.id).order("created_at", { ascending: false }),
  ]);

  const skillsByCategory = (skills ?? []).reduce<Record<string, { name: string; level: string }[]>>((acc, s) => {
    const skill = (s.skills as unknown) as { name: string; category: string } | null;
    if (!skill) return acc;
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push({ name: skill.name, level: s.level });
    return acc;
  }, {});

  return (
    <div className="px-8 py-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold mb-1">{candidate.name}</h1>
          <p className="text-muted-foreground text-sm">
            {candidate.seeking === "internship" ? "Seeking internship" : candidate.current_role ?? "Open to opportunities"}
            {candidate.location ? ` · ${candidate.location}` : ""}
          </p>
          <div className="flex items-center gap-4 mt-2">
            {candidate.github_url && (
              <a href={`https://${candidate.github_url.replace(/^https?:\/\//, "")}`} target="_blank" rel="noopener noreferrer" className="text-xs text-brand hover:opacity-80">
                GitHub ↗
              </a>
            )}
            {candidate.linkedin_url && (
              <a href={`https://${candidate.linkedin_url.replace(/^https?:\/\//, "")}`} target="_blank" rel="noopener noreferrer" className="text-xs text-brand hover:opacity-80">
                LinkedIn ↗
              </a>
            )}
          </div>
        </div>
        <div className="w-12 h-12 rounded-full bg-brand-subtle flex items-center justify-center text-brand text-xl font-bold font-heading shrink-0">
          {candidate.name.charAt(0).toUpperCase()}
        </div>
      </div>

      {candidate.bio && (
        <p className="text-foreground leading-relaxed mb-8 max-w-prose">{candidate.bio}</p>
      )}

      {/* Qualifications */}
      {(quals ?? []).length > 0 && (
        <section className="mb-8">
          <h2 className="font-heading font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
            Education & Qualifications
          </h2>
          <div className="flex flex-col gap-3">
            {quals!.map((q) => (
              <div key={q.id} className="flex items-start justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium text-sm text-foreground">{q.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {q.institution}
                    {q.field_of_study ? ` · ${q.field_of_study}` : ""}
                  </p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-xs text-muted-foreground tabular">
                    {q.start_date ? new Date(q.start_date).getFullYear() : ""}
                    {q.is_current ? "–Present" : q.end_date ? `–${new Date(q.end_date).getFullYear()}` : ""}
                  </p>
                  {q.grade && <p className="text-xs text-brand tabular font-medium mt-0.5">{q.grade}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Work experience */}
      {(work ?? []).length > 0 && (
        <section className="mb-8">
          <h2 className="font-heading font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
            Work Experience
          </h2>
          <div className="flex flex-col gap-4">
            {work!.map((w) => (
              <div key={w.id} className="py-3 border-b border-border">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <p className="font-medium text-sm text-foreground">{w.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {w.company}
                      {w.location ? ` · ${w.location}` : ""}
                      {" · "}
                      <span className="capitalize">{w.employment_type.replace("_", "-")}</span>
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground tabular shrink-0 ml-4">
                    {new Date(w.start_date).toLocaleDateString("en-MY", { month: "short", year: "numeric" })}
                    {" – "}
                    {w.is_current ? "Present" : w.end_date ? new Date(w.end_date).toLocaleDateString("en-MY", { month: "short", year: "numeric" }) : ""}
                  </p>
                </div>
                {w.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed mt-1.5 max-w-prose">{w.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {Object.keys(skillsByCategory).length > 0 && (
        <section className="mb-8">
          <h2 className="font-heading font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
            Skills
          </h2>
          <div className="flex flex-col gap-4">
            {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
              <div key={category}>
                <p className="text-xs text-muted-foreground font-medium mb-2">{category}</p>
                <div className="flex flex-wrap gap-2">
                  {categorySkills.map((skill) => (
                    <span
                      key={skill.name}
                      className="text-xs bg-secondary border border-border px-2.5 py-1 rounded-full text-foreground"
                    >
                      {skill.name}
                      <span className="text-muted-foreground ml-1">· {skill.level}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
