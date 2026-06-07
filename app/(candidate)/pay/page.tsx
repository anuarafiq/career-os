import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FairPayEngine } from "@/components/FairPayEngine";

export default async function PayPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", user.id).single();
  const { data: candidate } = await supabase
    .from("candidate_profiles")
    .select("current_role, location, years_exp")
    .eq("profile_id", profile?.id ?? "")
    .single();

  const { data: salaryData } = await supabase.from("salary_data").select("*");

  return (
    <FairPayEngine
      salaryData={salaryData ?? []}
      defaultRole={candidate?.current_role ?? ""}
      defaultLocation={candidate?.location ?? "Kuala Lumpur"}
    />
  );
}
