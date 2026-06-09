"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const SELECT_CLASS =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring text-foreground";

const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Retail",
  "Manufacturing",
  "Consulting",
  "Media",
  "Other",
];

const SIZES = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];

type Employer = {
  id: string;
  company_name: string;
  industry: string | null;
  size: string | null;
  website: string | null;
};

export function EmployerProfileForm({ employer }: { employer: Employer }) {
  const router = useRouter();

  const [companyName, setCompanyName] = useState(employer.company_name ?? "");
  const [industry, setIndustry] = useState(employer.industry ?? "");
  const [size, setSize] = useState(employer.size ?? "");
  const [website, setWebsite] = useState(employer.website ?? "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!companyName.trim()) return;

    setLoading(true);
    setError(null);

    const supabase = createClient();

    const { error: updateErr } = await supabase
      .from("employer_profiles")
      .update({
        company_name: companyName.trim(),
        industry: industry || null,
        size: size || null,
        website: website.trim() || null,
      })
      .eq("id", employer.id);

    if (updateErr) {
      setError(updateErr.message);
      setLoading(false);
      return;
    }

    router.push("/employer/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="company-name">Company name *</Label>
        <Input
          id="company-name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="e.g. Acme Corp"
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="industry">Industry</Label>
        <select
          id="industry"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className={SELECT_CLASS}
        >
          <option value="">Select industry</option>
          {INDUSTRIES.map((i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="size">Company size</Label>
        <select
          id="size"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          className={SELECT_CLASS}
        >
          <option value="">Select size</option>
          {SIZES.map((s) => (
            <option key={s} value={s}>{s} employees</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://yourcompany.com"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={loading || !companyName.trim()}>
          {loading ? "Saving..." : "Save changes"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
