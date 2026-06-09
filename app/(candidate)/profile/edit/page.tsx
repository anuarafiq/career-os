import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileEditForm } from "./ProfileEditForm";

export default async function ProfileEditPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) redirect("/onboarding");

  const { data: candidate } = await supabase
    .from("candidate_profiles")
    .select("id, name, location, bio, github_url, linkedin_url, seeking, job_title, years_exp")
    .eq("profile_id", profile.id)
    .single();

  if (!candidate) redirect("/onboarding");

  return (
    <div className="px-8 py-8 max-w-xl">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold mb-1">Edit profile</h1>
        <p className="text-sm text-muted-foreground">Update your personal info and preferences.</p>
      </div>
      <ProfileEditForm candidate={candidate} />
    </div>
  );
}
