import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Metadata } from "next";

type Props = { params: Promise<{ candidateId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { candidateId } = await params;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("candidate_profiles")
    .select("name, bio")
    .eq("id", candidateId)
    .single();
  if (!data) return { title: "Portfolio — Career OS" };
  return {
    title: `${data.name} — Career OS Portfolio`,
    description: data.bio ?? `View ${data.name}'s professional portfolio on Career OS.`,
  };
}

export default async function PublicPortfolioPage({ params }: Props) {
  const { candidateId } = await params;
  const supabase = createAdminClient();

  const { data: candidate } = await supabase
    .from("candidate_profiles")
    .select("id, name, location, bio, github_url, linkedin_url, seeking, job_title, years_exp")
    .eq("id", candidateId)
    .single();

  if (!candidate) notFound();

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
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      {/* Minimal nav */}
      <header className="border-b" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="max-w-3xl mx-auto px-8 py-4">
          <a href="/" className="font-heading font-bold text-sm" style={{ color: "var(--accent)" }}>
            Career OS
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-8 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
              {candidate.name}
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {candidate.seeking === "internship" ? "Seeking internship" : candidate.job_title ?? "Open to opportunities"}
              {candidate.location ? ` · ${candidate.location}` : ""}
            </p>
            <div className="flex items-center gap-4 mt-2">
              {candidate.github_url && (
                <a
                  href={`https://${candidate.github_url.replace(/^https?:\/\//, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs hover:opacity-80"
                  style={{ color: "var(--accent)" }}
                >
                  GitHub ↗
                </a>
              )}
              {candidate.linkedin_url && (
                <a
                  href={`https://${candidate.linkedin_url.replace(/^https?:\/\//, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs hover:opacity-80"
                  style={{ color: "var(--accent)" }}
                >
                  LinkedIn ↗
                </a>
              )}
            </div>
          </div>
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold font-heading shrink-0"
            style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}
          >
            {candidate.name.charAt(0).toUpperCase()}
          </div>
        </div>

        {candidate.bio && (
          <p className="leading-relaxed mb-8 max-w-prose" style={{ color: "var(--text-primary)" }}>
            {candidate.bio}
          </p>
        )}

        {/* Education */}
        {(quals ?? []).filter((q) => q.type === "education").length > 0 && (
          <section className="mb-8">
            <h2 className="font-heading font-semibold text-xs uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>
              Education
            </h2>
            <div className="flex flex-col gap-3">
              {quals!.filter((q) => q.type === "education").map((q) => (
                <div key={q.id} className="flex items-start justify-between py-3 border-b" style={{ borderColor: "var(--border-subtle)" }}>
                  <div>
                    <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{q.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                      {q.institution}{q.field_of_study ? ` · ${q.field_of_study}` : ""}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-xs tabular-nums" style={{ color: "var(--text-muted)" }}>
                      {q.start_date ? new Date(q.start_date).getFullYear() : ""}
                      {q.is_current ? "–Present" : q.end_date ? `–${new Date(q.end_date).getFullYear()}` : ""}
                    </p>
                    {q.grade && (
                      <p className="text-xs font-medium mt-0.5 tabular-nums" style={{ color: "var(--accent)" }}>{q.grade}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certificates */}
        {(quals ?? []).filter((q) => q.type === "certificate").length > 0 && (
          <section className="mb-8">
            <h2 className="font-heading font-semibold text-xs uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>
              Certificates
            </h2>
            <div className="flex flex-col gap-3">
              {quals!.filter((q) => q.type === "certificate").map((q) => {
                const isRecent = q.end_date && Date.now() - new Date(q.end_date).getTime() < 90 * 24 * 60 * 60 * 1000;
                return (
                  <div key={q.id} className="flex items-start justify-between py-3 border-b" style={{ borderColor: "var(--border-subtle)" }}>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{q.title}</p>
                        {isRecent && (
                          <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}>
                            Recent
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{q.institution}</p>
                        {q.credential_url && (
                          <>
                            <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}>
                              Coursera
                            </span>
                            <a href={q.credential_url} target="_blank" rel="noopener noreferrer" className="text-xs hover:opacity-80" style={{ color: "var(--accent)" }}>
                              Verify ↗
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      {q.end_date && (
                        <p className="text-xs tabular-nums" style={{ color: "var(--text-muted)" }}>
                          {new Date(q.end_date).getFullYear()}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Work Experience */}
        {(work ?? []).length > 0 && (
          <section className="mb-8">
            <h2 className="font-heading font-semibold text-xs uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>
              Work Experience
            </h2>
            <div className="flex flex-col gap-4">
              {work!.map((w) => (
                <div key={w.id} className="py-3 border-b" style={{ borderColor: "var(--border-subtle)" }}>
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{w.title}</p>
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        {w.company}{w.location ? ` · ${w.location}` : ""}{" · "}
                        <span className="capitalize">{w.employment_type.replace("_", "-")}</span>
                      </p>
                    </div>
                    <p className="text-xs tabular-nums shrink-0 ml-4" style={{ color: "var(--text-muted)" }}>
                      {new Date(w.start_date).toLocaleDateString("en-MY", { month: "short", year: "numeric" })}
                      {" – "}
                      {w.is_current ? "Present" : w.end_date ? new Date(w.end_date).toLocaleDateString("en-MY", { month: "short", year: "numeric" }) : ""}
                    </p>
                  </div>
                  {w.description && (
                    <p className="text-sm leading-relaxed mt-1.5 max-w-prose" style={{ color: "var(--text-secondary)" }}>
                      {w.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {Object.keys(skillsByCategory).length > 0 && (
          <section className="mb-8">
            <h2 className="font-heading font-semibold text-xs uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>
              Skills
            </h2>
            <div className="flex flex-col gap-4">
              {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                <div key={category}>
                  <p className="text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>{category}</p>
                  <div className="flex flex-wrap gap-2">
                    {categorySkills.map((skill) => (
                      <span
                        key={skill.name}
                        className="text-xs px-2.5 py-1 rounded-full border"
                        style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
                      >
                        {skill.name}
                        <span style={{ color: "var(--text-muted)" }} className="ml-1">· {skill.level}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {(portfolio ?? []).length > 0 && (
          <section className="mb-8">
            <h2 className="font-heading font-semibold text-xs uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>
              Projects
            </h2>
            <div className="flex flex-col gap-3">
              {portfolio!.map((item) => (
                <div key={item.id} className="py-3 border-b" style={{ borderColor: "var(--border-subtle)" }}>
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{item.title}</p>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs hover:opacity-80 shrink-0 ml-4"
                        style={{ color: "var(--accent)" }}
                      >
                        View ↗
                      </a>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{item.description}</p>
                  )}
                  {(item.tags ?? []).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(item.tags as string[]).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 rounded"
                          style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t py-6" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="max-w-3xl mx-auto px-8 flex items-center justify-between">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Powered by{" "}
            <a href="/" className="hover:opacity-80" style={{ color: "var(--accent)" }}>Career OS</a>
          </p>
          <a href="/signup" className="text-xs hover:opacity-80" style={{ color: "var(--accent)" }}>
            Build your profile →
          </a>
        </div>
      </footer>
    </div>
  );
}
