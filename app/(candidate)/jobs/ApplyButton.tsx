"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface ApplyButtonProps {
  jobId: string;
  candidateId: string;
  initialApplied: boolean;
}

export default function ApplyButton({ jobId, candidateId, initialApplied }: ApplyButtonProps) {
  const [applied, setApplied] = useState(initialApplied);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApply() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: insertError } = await supabase
      .from("applications")
      .insert({ job_id: jobId, candidate_id: candidateId });

    if (insertError) {
      if ((insertError as any).code === "23505") {
        setApplied(true);
      } else {
        setError("Failed to apply. Please try again.");
      }
    } else {
      setApplied(true);
    }
    setLoading(false);
  }

  if (applied) {
    return (
      <button
        disabled
        className="mt-3 text-xs px-3 py-1.5 rounded-md border border-[var(--success)] text-[var(--success)] opacity-70 cursor-default"
      >
        Applied ✓
      </button>
    );
  }

  return (
    <div className="mt-3">
      <button
        onClick={handleApply}
        disabled={loading}
        className="text-xs px-3 py-1.5 rounded-md bg-[var(--brand-subtle)] border border-[var(--brand-dim)] text-[var(--brand)] hover:bg-[var(--brand)] hover:text-[oklch(0.13_0.012_258)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Applying…" : "Apply"}
      </button>
      {error && <p className="mt-1 text-xs text-[var(--danger)]">{error}</p>}
    </div>
  );
}
