import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const DEMO_CANDIDATE = {
  email: "demo.candidate@careeros.dev",
  password: "DemoCandidate2026",
};

const DEMO_EMPLOYER = {
  email: "demo.employer@careeros.dev",
  password: "DemoEmployer2026",
};

export async function POST(req: Request) {
  try {
    const { role } = (await req.json()) as { role: "candidate" | "employer" };
    if (role !== "candidate" && role !== "employer") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const admin = createAdminClient();
    const creds = role === "candidate" ? DEMO_CANDIDATE : DEMO_EMPLOYER;

    // Find or create auth user
    const { data: listData } = await admin.auth.admin.listUsers();
    let userId = listData?.users.find((u) => u.email === creds.email)?.id;

    if (!userId) {
      const { data: created, error } = await admin.auth.admin.createUser({
        email: creds.email,
        password: creds.password,
        email_confirm: true,
      });
      if (error || !created.user) {
        return NextResponse.json(
          { error: error?.message ?? "Failed to create demo user" },
          { status: 500 }
        );
      }
      userId = created.user.id;
    }

    // Seed data if profile doesn't exist yet
    const { data: existingProfile } = await admin
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (!existingProfile) {
      if (role === "candidate") {
        await seedCandidate(admin, userId);
      } else {
        await seedEmployer(admin, userId);
      }
    }

    return NextResponse.json({ email: creds.email, password: creds.password });
  } catch (e) {
    console.error("[demo] unexpected error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unexpected error" },
      { status: 500 }
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function assertData<T>(data: T | null, error: unknown, label: string): T {
  if (error) throw new Error(`[demo] ${label}: ${JSON.stringify(error)}`);
  if (!data) throw new Error(`[demo] ${label}: returned null`);
  return data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function seedCandidate(admin: any, userId: string) {
  const { data: profile, error: profileErr } = await admin
    .from("profiles")
    .insert({ user_id: userId, role: "candidate" })
    .select("id")
    .single();
  assertData(profile, profileErr, "insert profiles");

  const { data: candidate, error: candidateErr } = await admin
    .from("candidate_profiles")
    .insert({
      profile_id: profile.id,
      name: "Aishah Rahman",
      location: "Kuala Lumpur",
      bio: "Final-year Computer Science student at UTM. I build web apps and enjoy solving algorithmic problems. Actively seeking a software engineering internship to bridge academic theory with industry practice.",
      github_url: "https://github.com/aisharahman",
      linkedin_url: "https://linkedin.com/in/aisharahman",
      seeking: "internship",
      job_title: "Software Engineering Intern",
      years_exp: 1,
    })
    .select("id")
    .single();
  assertData(candidate, candidateErr, "insert candidate_profiles");

  const candidateId = candidate.id;

  const skillsToAdd = [
    { name: "Python", category: "Backend", level: "mid" },
    { name: "JavaScript", category: "Frontend", level: "mid" },
    { name: "React", category: "Frontend", level: "beginner" },
    { name: "SQL", category: "Database", level: "beginner" },
    { name: "Git", category: "Tools", level: "mid" },
  ];

  for (const s of skillsToAdd) {
    const { data: skill, error: skillErr } = await admin
      .from("skills")
      .upsert({ name: s.name, category: s.category }, { onConflict: "name" })
      .select("id")
      .single();
    assertData(skill, skillErr, `upsert skill ${s.name}`);

    await admin
      .from("candidate_skills")
      .upsert(
        { candidate_id: candidateId, skill_id: skill.id, level: s.level },
        { onConflict: "candidate_id,skill_id" }
      );
  }

  await admin.from("qualifications").insert([
    {
      candidate_id: candidateId,
      type: "education",
      institution: "Universiti Teknologi Malaysia",
      title: "Bachelor of Computer Science",
      field_of_study: "Software Engineering",
      start_date: "2022-09-01",
      end_date: "2026-06-01",
      is_current: true,
      grade: "3.75 / 4.00",
    },
    {
      candidate_id: candidateId,
      type: "certificate",
      institution: "Meta",
      title: "Meta Front-End Developer Certificate",
      start_date: "2024-01-01",
      end_date: "2024-03-01",
      credential_url: "https://www.coursera.org/account/accomplishments/verify/META2024DEMO",
    },
    {
      candidate_id: candidateId,
      type: "certificate",
      institution: "DeepLearning.AI",
      title: "Machine Learning Specialization",
      start_date: "2024-06-01",
      end_date: "2024-09-01",
      credential_url: "https://www.coursera.org/account/accomplishments/verify/DL2024DEMO",
    },
  ]);

  await admin.from("work_experiences").insert([
    {
      candidate_id: candidateId,
      company: "Grab",
      title: "Software Engineering Intern",
      location: "Kuala Lumpur",
      start_date: "2024-07-01",
      end_date: "2024-09-30",
      is_current: false,
      employment_type: "internship",
      description:
        "Worked on the driver incentives dashboard. Built React components, wrote Python ETL scripts to process ride data, and improved dashboard load time by 30% through query optimisation.",
    },
  ]);

  await admin.from("portfolio_items").insert([
    {
      candidate_id: candidateId,
      title: "StudyBuddy — Peer Matching App",
      description:
        "A web app that matches UTM students by course and study schedule. Built with Next.js + Supabase. 200+ active users within the first month.",
      url: "https://github.com/aisharahman/studybuddy",
      tags: ["Next.js", "Supabase", "TypeScript"],
      date: "2024-11-01",
    },
    {
      candidate_id: candidateId,
      title: "Expense Tracker CLI",
      description:
        "Command-line expense tracker with SQLite storage and category analytics. Built in Python as a learning project.",
      url: "https://github.com/aisharahman/expense-cli",
      tags: ["Python", "SQLite", "CLI"],
      date: "2024-05-01",
    },
  ]);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function seedEmployer(admin: any, userId: string) {
  const { data: profile, error: profileErr } = await admin
    .from("profiles")
    .insert({ user_id: userId, role: "employer" })
    .select("id")
    .single();
  assertData(profile, profileErr, "insert profiles");

  const { data: employer, error: employerErr } = await admin
    .from("employer_profiles")
    .insert({
      profile_id: profile.id,
      company_name: "TechCorp Malaysia",
      industry: "Technology",
      size: "51-200",
      website: "https://techcorp.my",
    })
    .select("id")
    .single();
  assertData(employer, employerErr, "insert employer_profiles");

  const employerId = employer.id;

  // Jobs
  await admin.from("jobs").insert([
    {
      employer_id: employerId,
      title: "Software Engineering Intern",
      location: "Kuala Lumpur",
      salary_min: 1800,
      salary_max: 2500,
      required_skills: ["Python", "JavaScript", "React"],
      description:
        "Join our product team to build features used by thousands of users. You'll work across the stack — React frontend, Python APIs, and Postgres. Great mentorship, real ownership from day one.",
      employment_type: "internship",
      status: "open",
    },
    {
      employer_id: employerId,
      title: "Frontend Developer",
      location: "Kuala Lumpur",
      salary_min: 5000,
      salary_max: 8000,
      required_skills: ["React", "TypeScript", "CSS"],
      description:
        "We're building a design-forward fintech product and need a frontend engineer who cares deeply about UI quality, performance, and accessibility.",
      employment_type: "full_time",
      status: "open",
    },
    {
      employer_id: employerId,
      title: "Data Analyst",
      location: "Kuala Lumpur",
      salary_min: 4500,
      salary_max: 7000,
      required_skills: ["SQL", "Python", "Tableau"],
      description:
        "Work with our data team to surface insights from user behaviour and operational metrics. Own dashboards, write complex SQL, and present findings to leadership.",
      employment_type: "full_time",
      status: "open",
    },
  ]);
}
