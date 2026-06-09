"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

const SELECT_CLASS =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring text-foreground";

export default function NewJobPage() {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [jdLoading, setJdLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addSkill(raw: string) {
    const val = raw.trim().replace(/,$/, "");
    if (val && !skills.includes(val)) setSkills((prev) => [...prev, val]);
    setSkillInput("");
  }

  function handleSkillKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(skillInput);
    } else if (e.key === "Backspace" && !skillInput && skills.length) {
      setSkills((prev) => prev.slice(0, -1));
    }
  }

  async function generateJD() {
    if (!description.trim()) return;
    setJdLoading(true);
    try {
      const res = await fetch("/api/ai/jd-writer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, location, employmentType, skills, roughNotes: description }),
      });
      const data = await res.json();
      if (data.description) setDescription(data.description);
    } finally {
      setJdLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !location.trim() || !employmentType) return;

    setLoading(true);
    setError(null);

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Not authenticated.");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (profileErr || !profile) {
      setError("Could not find your account profile.");
      setLoading(false);
      return;
    }

    const { data: employer, error: employerErr } = await supabase
      .from("employer_profiles")
      .select("id")
      .eq("profile_id", profile.id)
      .single();

    if (employerErr || !employer) {
      setError("Complete your company profile first.");
      setLoading(false);
      return;
    }

    const { error: insertErr } = await supabase.from("jobs").insert({
      employer_id: employer.id,
      title: title.trim(),
      location: location.trim(),
      employment_type: employmentType,
      salary_min: salaryMin.trim() ? parseInt(salaryMin, 10) : null,
      salary_max: salaryMax.trim() ? parseInt(salaryMax, 10) : null,
      required_skills: skills,
      description: description.trim() || null,
      status: "open",
    });

    if (insertErr) {
      setError(insertErr.message);
      setLoading(false);
      return;
    }

    window.location.href = "/employer/jobs";
  }

  const canSubmit = title.trim() && location.trim() && employmentType && !loading;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-8 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-bold text-[var(--text-primary)]">
            Post a new job
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Fields marked * are required.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] -mb-2">
            Role details
          </p>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Job title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Software Engineer (Backend)"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Kuala Lumpur (Remote OK)"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="employment-type">Employment type *</Label>
            <select
              id="employment-type"
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
              className={SELECT_CLASS}
            >
              <option value="" disabled>
                Select type
              </option>
              <option value="full_time">Full-time</option>
              <option value="part_time">Part-time</option>
              <option value="internship">Internship</option>
              <option value="contract">Contract</option>
            </select>
          </div>

          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] -mb-2">
            Compensation
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="salary-min">Min salary (RM)</Label>
              <Input
                id="salary-min"
                type="number"
                min="0"
                step="100"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                placeholder="e.g. 5000"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="salary-max">Max salary (RM)</Label>
              <Input
                id="salary-max"
                type="number"
                min="0"
                step="100"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
                placeholder="e.g. 8000"
              />
            </div>
          </div>

          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] -mb-2">
            Additional info
          </p>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="skills-input">Required skills</Label>
            <div className="flex flex-wrap gap-1.5 min-h-9 w-full rounded-md border border-input bg-transparent px-3 py-1.5 text-sm shadow-sm focus-within:ring-1 focus-within:ring-ring">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="flex items-center gap-1 bg-brand-subtle text-brand rounded px-2 py-0.5 text-xs font-medium shrink-0"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => setSkills(skills.filter((s) => s !== skill))}
                    className="hover:opacity-70 transition-opacity leading-none"
                    aria-label={`Remove ${skill}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                id="skills-input"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                onBlur={() => skillInput.trim() && addSkill(skillInput)}
                placeholder={skills.length === 0 ? "e.g. React, Python — press Enter to add" : ""}
                className="flex-1 min-w-24 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Description</Label>
              <button
                type="button"
                onClick={generateJD}
                disabled={!description.trim() || jdLoading}
                className="text-xs text-[var(--brand)] disabled:opacity-40 hover:underline transition-opacity"
              >
                {jdLoading ? "Generating…" : "Polish with AI ✦"}
              </button>
            </div>
            <Textarea
              id="description"
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Paste rough notes or bullet points here — then click 'Polish with AI' to generate a full JD, or write it manually."
            />
          </div>

          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

          <Button type="submit" disabled={!canSubmit} className="mt-1">
            {loading ? "Posting…" : "Post job"}
          </Button>
        </form>
      </div>
    </div>
  );
}
