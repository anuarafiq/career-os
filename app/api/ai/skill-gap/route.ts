import { createClient } from "@/lib/supabase/server";
import { groq, MODEL } from "@/lib/claude/client";
import { generateText } from "ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { currentRole, targetRole, missingSkills } = (await req.json()) as {
    currentRole: string;
    targetRole: string;
    missingSkills: string[];
  };

  if (!targetRole || !Array.isArray(missingSkills) || missingSkills.length === 0) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const prompt = `You are a career development advisor for professionals in Malaysia and Southeast Asia.

A candidate ${currentRole ? `currently working as ${currentRole}` : "early in their career"} wants to transition to ${targetRole}.

They need to develop these specific skills to make this transition:
${missingSkills.map((s, i) => `${i + 1}. ${s}`).join("\n")}

Create a focused learning roadmap. Return ONLY a JSON object (no markdown, no explanation) in this exact format:
{
  "summary": "1-2 sentence overview of the transition and what it takes",
  "steps": [
    {
      "skill": "exact skill name from the list above",
      "action": "concrete learning action (e.g. 'Complete a project using X', 'Study Y fundamentals')",
      "resource": "specific resource recommendation (course name, platform, book title, or practice site)"
    }
  ],
  "estimatedMonths": 6
}

Rules:
- One step per missing skill exactly — do not add extra steps or merge skills
- Resources must be concrete and real (Coursera, LeetCode, official docs, specific book titles)
- estimatedMonths is an integer reflecting realistic self-study pace alongside a full-time role
- Tailor advice for the Malaysian/APAC tech job market where relevant
- summary must be under 40 words`;

  const { text } = await generateText({
    model: groq(MODEL),
    prompt,
    maxOutputTokens: 800,
  });

  let roadmap = null;
  try {
    roadmap = JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        roadmap = JSON.parse(match[0]);
      } catch {
        roadmap = null;
      }
    }
  }

  if (!roadmap) {
    return NextResponse.json({ error: "Failed to generate roadmap" }, { status: 500 });
  }

  return NextResponse.json({ roadmap });
}
