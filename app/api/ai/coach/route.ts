import { createClient } from "@/lib/supabase/server";
import { anthropic, MODEL } from "@/lib/claude/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messages, sessionId } = await req.json() as {
    messages: { role: "user" | "assistant"; content: string }[];
    sessionId?: string;
  };

  // Fetch candidate context
  const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", user.id).single();
  const { data: candidate } = await supabase
    .from("candidate_profiles")
    .select("name, current_role, years_exp, location, seeking, bio")
    .eq("profile_id", profile?.id ?? "")
    .single();

  const { data: skills } = await supabase
    .from("candidate_skills")
    .select("level, skills(name, category)")
    .eq("candidate_id", (await supabase.from("candidate_profiles").select("id").eq("profile_id", profile?.id ?? "").single()).data?.id ?? "");

  const { data: quals } = await supabase
    .from("qualifications")
    .select("type, institution, title, grade")
    .eq("candidate_id", (await supabase.from("candidate_profiles").select("id").eq("profile_id", profile?.id ?? "").single()).data?.id ?? "");

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
- Current role: ${candidate?.current_role ?? "Not specified (may be a fresh grad or intern seeker)"}
- Years of experience: ${candidate?.years_exp ?? "Not specified"}
- Location: ${candidate?.location ?? "Not specified"}
- Bio: ${candidate?.bio ?? "Not provided"}
- Skills: ${skillSummary || "Not specified"}
- Qualifications: ${qualSummary || "Not specified"}

Guidelines:
- Give concrete, actionable advice tailored to the Malaysian/APAC job market
- Reference specific skills, roles, or paths when relevant
- Never claim to predict the future — frame everything as realistic options and trade-offs
- For intern seekers: focus on internship hunting strategies, portfolio building, and entry-level transitions
- For job seekers: focus on career progression, salary negotiation, and skill gaps to target roles
- Keep responses concise but substantive — 2-4 paragraphs max
- You can mention salary ranges in MYR when relevant (e.g., "Senior Software Engineers in KL typically earn RM 9,000–15,000/month")
- Do not repeat the user's profile back to them unless relevant`;

  const stream = await anthropic.messages.stream({
    model: MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`));
        }
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
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
