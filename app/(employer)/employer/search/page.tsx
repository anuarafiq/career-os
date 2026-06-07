"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type MatchResult = {
  candidateId: string;
  name: string;
  score: number;
  summary: string;
};

export default function SmartMatchPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [results, setResults] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [message, setMessage] = useState("");

  async function handleMatch() {
    if (!jobDescription.trim()) return;
    setLoading(true);
    setSearched(false);

    const res = await fetch("/api/ai/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobDescription }),
    });

    const data = await res.json();
    setResults(data.results ?? []);
    setMessage(data.message ?? "");
    setSearched(true);
    setLoading(false);
  }

  return (
    <div className="px-8 py-8 max-w-3xl">
      <h1 className="font-heading text-3xl font-bold mb-1">Smart Talent Matching</h1>
      <p className="text-muted-foreground text-sm mb-8">
        Describe the role you&apos;re hiring for. Our AI will rank the best-fit candidates from the talent pool.
      </p>

      <div className="bg-card border border-border rounded-lg p-5 mb-6">
        <div className="flex flex-col gap-3">
          <Label htmlFor="jd">Job description or requirements</Label>
          <Textarea
            id="jd"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="e.g. We're looking for a Senior Software Engineer with 3+ years of React and Node.js experience, strong TypeScript skills, and experience working in agile teams. Based in Kuala Lumpur, full-time..."
            rows={6}
          />
          <Button onClick={handleMatch} disabled={!jobDescription.trim() || loading} className="self-end">
            {loading ? "Matching..." : "Find candidates"}
          </Button>
        </div>
      </div>

      {searched && (
        <div>
          <h2 className="font-heading font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
            {results.length > 0 ? `${results.length} matched candidate${results.length !== 1 ? "s" : ""}` : "No matches found"}
          </h2>

          {message && (
            <p className="text-sm text-muted-foreground mb-4">{message}</p>
          )}

          <div className="flex flex-col gap-3">
            {results.map((r, i) => (
              <div key={r.candidateId} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground tabular font-medium w-4">#{i + 1}</span>
                    <div className="w-8 h-8 rounded-full bg-brand-subtle flex items-center justify-center text-brand text-sm font-bold shrink-0">
                      {r.name.charAt(0).toUpperCase()}
                    </div>
                    <p className="font-semibold text-sm text-foreground">{r.name}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="h-1.5 w-16 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand rounded-full"
                        style={{ width: `${r.score}%` }}
                      />
                    </div>
                    <span className="text-brand tabular font-bold text-sm">{r.score}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed pl-11">{r.summary}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
