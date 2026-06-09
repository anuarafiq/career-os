import { createClient } from "@/lib/supabase/server";
import { groq, MODEL } from "@/lib/claude/client";
import { generateText } from "ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { jobId } = await req.json() as { jobId: string };

  const { data: job } = await supabase
    .from("jobs")
    .select("title, required_skills, location, employment_type, salary_min, salary_max")
    .eq("id", jobId)
    .single();

  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) return NextResponse.json({ error: "No profile" }, { status: 404 });

  const { data: candidate } = await supabase
    .from("candidate_profiles")
    .select("current_role, seeking, years_exp, candidate_skills(skills(name))")
    .eq("profile_id", profile.id)
    .single();

  if (!candidate) return NextResponse.json({ error: "No candidate profile" }, { status: 404 });

  const skills = (candidate.candidate_skills as unknown as { skills: { name: string } | null }[])
    ?.map((s) => s.skills?.name)
    .filter(Boolean)
    .join(", ") || "Not specified";

  const prompt = `You are a job fit evaluator. Score how well this candidate fits the job.
Return ONLY JSON (no markdown, no explanation): { "score": <0-100>, "summary": "<one sentence why they fit or don't>" }

Job: ${job.title}
Required skills: ${(job.required_skills ?? []).join(", ") || "Not specified"}
Location: ${job.location ?? "Not specified"}

Candidate current role: ${candidate.current_role ?? "Not specified"}
Candidate seeking: ${candidate.seeking ?? "Not specified"}
Candidate experience: ${candidate.years_exp ?? 0} years
Candidate skills: ${skills}`;

  const { text } = await generateText({
    model: groq(MODEL),
    prompt,
    maxOutputTokens: 256,
  });

  let result = { score: 0, summary: "" };
  try {
    result = JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try { result = JSON.parse(match[0]); } catch { /* silent */ }
    }
  }

  return NextResponse.json(result);
}
