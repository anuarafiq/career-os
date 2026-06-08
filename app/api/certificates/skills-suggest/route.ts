import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { groq, MODEL } from "@/lib/claude/client";
import { generateText } from "ai";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, institution } = await req.json() as { title?: string; institution?: string };
  if (!title) return NextResponse.json({ error: "title is required" }, { status: 400 });

  const prompt = `Given the certificate "${title}"${institution ? ` from "${institution}"` : ""}, list up to 6 specific technical skills this course teaches. Return ONLY a JSON array of skill name strings. Example: ["React", "TypeScript", "CSS"]. No explanation, no markdown, just the array.`;

  try {
    const { text } = await generateText({
      model: groq(MODEL),
      prompt,
      maxOutputTokens: 100,
    });

    const match = text.match(/\[[\s\S]*?\]/);
    if (!match) return NextResponse.json({ skills: [] });

    const skills: unknown = JSON.parse(match[0]);
    if (!Array.isArray(skills)) return NextResponse.json({ skills: [] });

    const filtered = skills.filter((s): s is string => typeof s === "string").slice(0, 6);
    return NextResponse.json({ skills: filtered });
  } catch {
    return NextResponse.json({ skills: [] });
  }
}
