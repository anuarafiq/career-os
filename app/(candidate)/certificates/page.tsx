import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CertificatesClient } from "./CertificatesClient";

export default async function CertificatesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", user.id).single();
  if (!profile) redirect("/login");

  const { data: candidate } = await supabase
    .from("candidate_profiles")
    .select("id")
    .eq("profile_id", profile.id)
    .single();

  if (!candidate) redirect("/onboarding");

  const [{ data: certs }, { data: skillRows }, { data: careerNodes }, { data: careerEdges }] = await Promise.all([
    supabase
      .from("qualifications")
      .select("*")
      .eq("candidate_id", candidate.id)
      .eq("type", "certificate")
      .order("created_at", { ascending: false }),
    supabase
      .from("candidate_skills")
      .select("skills(name)")
      .eq("candidate_id", candidate.id),
    supabase.from("career_nodes").select("id, title, category, level"),
    supabase.from("career_edges").select("to_node_id, skill_gaps"),
  ]);

  const existingSkillNames = (skillRows ?? [])
    .map((s) => (s.skills as unknown as { name: string } | null)?.name)
    .filter((n): n is string => !!n);

  return (
    <CertificatesClient
      certs={certs ?? []}
      candidateId={candidate.id}
      existingSkillNames={existingSkillNames}
      careerNodes={careerNodes ?? []}
      careerEdges={careerEdges ?? []}
    />
  );
}
