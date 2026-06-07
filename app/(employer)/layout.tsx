import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EmployerSidebar } from "@/components/EmployerSidebar";

export default async function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("user_id", user.id)
    .single();

  if (!profile || profile.role !== "employer") redirect("/dashboard");

  const { data: employer } = await supabase
    .from("employer_profiles")
    .select("company_name")
    .eq("profile_id", profile.id)
    .single();

  if (!employer) {
    // Employer hasn't completed onboarding yet - show minimal shell
  }

  return (
    <div className="flex min-h-screen bg-background">
      <EmployerSidebar
        companyName={employer?.company_name ?? user.email ?? ""}
        email={user.email ?? ""}
      />
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
