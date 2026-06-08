import { createClient } from "@/lib/supabase/server";
import { anthropic, MODEL } from "@/lib/claude/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { jobDescription } = await req.json() as { jobDescription: string };

  // Fetch candidates with their skills
  const { data: candidates } = await supabase
    .from("candidate_profiles")
    .select("id, name, job_title, years_exp, location, bio, seeking, candidate_skills(level, skills(name))")
    .limit(50);

  if (!candidates || candidates.length === 0) {
    return NextResponse.json({ results: [], message: "No candidates in pool yet." });
  }

  const candidateSummaries = candidates.map((c) => {
    const skills = (c.candidate_skills as unknown as { level: string; skills: { name: string } | null }[])
      ?.map((s) => s.skills?.name)
      .filter(Boolean)
      .join(", ");
    return `ID: ${c.id}
Name: ${c.name}
Role: ${c.job_title ?? "No current role (intern/fresh grad)"}
Experience: ${c.years_exp ?? 0} years
Location: ${c.location ?? "Not specified"}
Seeking: ${c.seeking}
Skills: ${skills || "Not specified"}
Bio: ${c.bio ?? "Not provided"}`;
  }).join("\n\n---\n\n");

  const prompt = `You are a talent matching expert. Given a job description and a list of candidates, rank the top 5 most suitable candidates.

JOB DESCRIPTION:
${jobDescription}

CANDIDATES:
${candidateSummaries}

Return ONLY a JSON array (no markdown, no explanation) in this exact format:
[
  {
    "candidateId": "uuid-here",
    "name": "Full Name",
    "score": 87,
    "summary": "2-3 sentence fit explanation mentioning specific skills and relevant experience"
  }
]

Score from 0-100. Only include candidates with score >= 40. Sort by score descending. Return max 5.`;

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";

  let results = [];
  try {
    results = JSON.parse(text);
  } catch {
    // Claude sometimes adds commentary — extract JSON
    const match = text.match(/\[[\s\S]*\]/);
    if (match) {
      try { results = JSON.parse(match[0]); } catch { results = []; }
    }
  }

  return NextResponse.json({ results });
}
