import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CandidateSidebar } from "@/components/CandidateSidebar";

export default async function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Check if onboarding is complete
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("user_id", user.id)
    .single();

  if (!profile) redirect("/login");

  if (profile.role !== "candidate") redirect("/dashboard");

  const { data: candidateProfile } = await supabase
    .from("candidate_profiles")
    .select("id, name")
    .eq("profile_id", profile.id)
    .single();

  const isOnboardingRoute =
    typeof window === "undefined"
      ? false
      : window.location.pathname === "/onboarding";

  if (!candidateProfile && !isOnboardingRoute) {
    redirect("/onboarding");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <CandidateSidebar
        name={candidateProfile?.name ?? user.email ?? ""}
        email={user.email ?? ""}
      />
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
