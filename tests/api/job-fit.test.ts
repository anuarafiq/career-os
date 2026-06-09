import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("ai", () => ({
  generateText: vi.fn(),
}));

vi.mock("@/lib/claude/client", () => ({
  groq: vi.fn(() => "mock-groq-model"),
  MODEL: "mock-model",
}));

import { createClient } from "@/lib/supabase/server";
import { generateText } from "ai";
import { POST } from "@/app/api/ai/job-fit/route";

const mockUser = { id: "user-1" };

function makeSupabaseMock({
  user = mockUser,
  job = null as object | null,
  profile = null as object | null,
  candidate = null as object | null,
} = {}) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user } }),
    },
    from: vi.fn((table: string) => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data:
          table === "jobs"
            ? job
            : table === "profiles"
            ? profile
            : table === "candidate_profiles"
            ? candidate
            : null,
      }),
    })),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/ai/job-fit", () => {
  it("returns 401 when not authenticated", async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock({ user: null as never }) as never);

    const req = new Request("http://localhost/api/ai/job-fit", {
      method: "POST",
      body: JSON.stringify({ jobId: "job-1" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 404 when job not found", async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({ job: null, profile: { id: "p-1" }, candidate: { id: "c-1", current_role: "Dev", seeking: "full_time", years_exp: 2, candidate_skills: [] } }) as never
    );

    const req = new Request("http://localhost/api/ai/job-fit", {
      method: "POST",
      body: JSON.stringify({ jobId: "missing-job" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it("returns score and summary from Groq", async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        job: { title: "Frontend Dev", required_skills: ["React"], location: "KL", employment_type: "full_time", salary_min: 5000, salary_max: 8000 },
        profile: { id: "p-1" },
        candidate: { current_role: "Junior Dev", seeking: "full_time", years_exp: 2, candidate_skills: [{ skills: { name: "React" } }] },
      }) as never
    );
    vi.mocked(generateText).mockResolvedValue({
      text: JSON.stringify({ score: 85, summary: "Strong React skills match well." }),
    } as never);

    const req = new Request("http://localhost/api/ai/job-fit", {
      method: "POST",
      body: JSON.stringify({ jobId: "job-1" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.score).toBe(85);
    expect(typeof json.summary).toBe("string");
  });

  it("score is between 0 and 100", async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        job: { title: "Data Scientist", required_skills: ["Python", "ML"], location: "Remote", employment_type: "full_time", salary_min: 8000, salary_max: 12000 },
        profile: { id: "p-1" },
        candidate: { current_role: "Analyst", seeking: "full_time", years_exp: 1, candidate_skills: [] },
      }) as never
    );
    vi.mocked(generateText).mockResolvedValue({
      text: JSON.stringify({ score: 42, summary: "Some skill gaps in ML." }),
    } as never);

    const req = new Request("http://localhost/api/ai/job-fit", {
      method: "POST",
      body: JSON.stringify({ jobId: "job-2" }),
    });

    const res = await POST(req);
    const json = await res.json();
    expect(json.score).toBeGreaterThanOrEqual(0);
    expect(json.score).toBeLessThanOrEqual(100);
  });
});
