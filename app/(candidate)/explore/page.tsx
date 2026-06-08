import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CareerPathExplorer } from "@/components/CareerPathExplorer";

export default async function ExplorePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", user.id).single();
  if (!profile) redirect("/login");

  const { data: candidate } = await supabase
    .from("candidate_profiles")
    .select("id, job_title, seeking")
    .eq("profile_id", profile.id)
    .single();

  if (!candidate) redirect("/onboarding");

  const [{ data: nodes }, { data: edges }] = await Promise.all([
    supabase.from("career_nodes").select("*"),
    supabase.from("career_edges").select("*"),
  ]);

  return (
    <CareerPathExplorer
      nodes={nodes ?? []}
      edges={edges ?? []}
      currentRole={candidate.job_title}
      seeking={candidate.seeking}
    />
  );
}
