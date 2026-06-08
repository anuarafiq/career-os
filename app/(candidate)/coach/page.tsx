import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CoachChat } from "@/components/CoachChat";

export default async function CoachPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", user.id).single();
  if (!profile) redirect("/login");

  const { data: candidate } = await supabase
    .from("candidate_profiles")
    .select("id, name, seeking, job_title")
    .eq("profile_id", profile.id)
    .single();

  if (!candidate) redirect("/onboarding");

  return (
    <CoachChat
      candidateName={candidate.name}
      seeking={candidate.seeking}
      currentRole={candidate.job_title}
    />
  );
}
