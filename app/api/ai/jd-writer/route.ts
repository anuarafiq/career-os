import { createClient } from "@/lib/supabase/server";
import { groq, MODEL } from "@/lib/claude/client";
import { generateText } from "ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, location, employmentType, skills, roughNotes } = await req.json() as {
    title: string;
    location: string;
    employmentType: string;
    skills: string[];
    roughNotes: string;
  };

  if (!title?.trim() || !roughNotes?.trim()) {
    return NextResponse.json({ error: "title and roughNotes are required" }, { status: 400 });
  }

  const prompt = `You are a professional technical recruiter. Write a polished job description based on the employer's rough notes below.

Role: ${title}
Location: ${location || "Not specified"}
Employment type: ${employmentType?.replace("_", " ") || "Not specified"}
Required skills: ${skills?.length ? skills.join(", ") : "Not specified"}

Employer's rough notes:
${roughNotes}

Write 3-4 paragraphs covering: role overview, key responsibilities, requirements, and what the company offers. Plain text only — no markdown headers, no bullet points. Sound direct and specific. Return only the job description text.`;

  const { text } = await generateText({
    model: groq(MODEL),
    prompt,
    maxOutputTokens: 800,
  });

  return NextResponse.json({ description: text.trim() });
}
