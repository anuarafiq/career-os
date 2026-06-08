import { createClient } from "@/lib/supabase/server";
import { groq, MODEL } from "@/lib/claude/client";
import { streamText } from "ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messages } = await req.json() as {
    messages: { role: "user" | "assistant"; content: string }[];
  };

  const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", user.id).single();
  const { data: candidate } = await supabase
    .from("candidate_profiles")
    .select("name, job_title, years_exp, location, seeking, bio")
    .eq("profile_id", profile?.id ?? "")
    .single();

  const candidateId = (await supabase.from("candidate_profiles").select("id").eq("profile_id", profile?.id ?? "").single()).data?.id ?? "";

  const { data: skills } = await supabase
    .from("candidate_skills")
    .select("level, skills(name, category)")
    .eq("candidate_id", candidateId);

  const { data: quals } = await supabase
    .from("qualifications")
    .select("type, institution, title, grade")
    .eq("candidate_id", candidateId);

  const skillSummary = skills
    ?.map((s) => {
      const skill = (s.skills as unknown) as { name: string; category: string } | null;
      return skill ? `${skill.name} (${s.level})` : null;
    })
    .filter(Boolean)
    .join(", ");

  const qualSummary = quals
    ?.map((q) => `${q.title} at ${q.institution}${q.grade ? ` (${q.grade})` : ""}`)
    .join("; ");

  const systemPrompt = `You are an expert career coach for Career OS, a career navigation platform for professionals in Asia (primarily Malaysia).

Your user's profile:
- Name: ${candidate?.name ?? "Unknown"}
- Seeking: ${candidate?.seeking === "internship" ? "an internship" : "a full-time role"}
- Current role: ${candidate?.job_title ?? "Not specified (may be a fresh grad or intern seeker)"}
- Years of experience: ${candidate?.years_exp ?? "Not specified"}
- Location: ${candidate?.location ?? "Not specified"}
- Bio: ${candidate?.bio ?? "Not provided"}
- Skills: ${skillSummary || "Not specified"}
- Qualifications: ${qualSummary || "Not specified"}

Response length rules (strict):
- Simple questions (yes/no, definitions, quick facts): 1-3 sentences. Stop there.
- Moderate questions (how-to, comparisons): 1 short paragraph or a brief bullet list. No preamble.
- Complex questions (career planning, strategy, analysis): max 3 short paragraphs or a structured list. Never exceed this.
- Never pad with intros like "Great question" or sign-offs like "Good luck!". Get to the point immediately.

Format rules:
- Use markdown. Use bullet lists or numbered steps when listing items — never run them together in a sentence.
- Bold key terms or action items when helpful.
- One blank line between paragraphs or sections. No walls of text.

Content rules:
- Give concrete, actionable advice tailored to the Malaysian/APAC job market
- Reference specific skills, roles, or paths when relevant
- Never claim to predict the future — frame everything as realistic options and trade-offs
- For intern seekers: focus on internship hunting strategies, portfolio building, and entry-level transitions
- For job seekers: focus on career progression, salary negotiation, and skill gaps to target roles
- You can mention salary ranges in MYR when relevant (e.g., "Senior Software Engineers in KL typically earn RM 9,000–15,000/month")
- Do not repeat the user's profile back to them unless relevant`;

  const encoder = new TextEncoder();

  const result = streamText({
    model: groq(MODEL),
    system: systemPrompt,
    messages: messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
    maxOutputTokens: 512,
  });

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const text of result.textStream) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err) {
        console.error("[coach] stream error:", err);
        controller.error(err);
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
