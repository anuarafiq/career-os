import Link from "next/link";
import DemoLogin from "@/components/DemoLogin";

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-border">
        <span className="font-heading text-xl font-semibold tracking-tight text-foreground">
          Career<span className="text-brand">OS</span>
        </span>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity font-medium"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-8 py-24 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-brand bg-brand-subtle px-3 py-1.5 rounded-full mb-8 tracking-wide uppercase">
          Talentbank Hackathon 2026
        </div>

        <h1 className="font-heading text-5xl md:text-7xl font-bold tracking-tight leading-[1.08] max-w-4xl mb-6">
          Navigate your career.{" "}
          <br />
          <span className="text-brand">See where you can go.</span>
        </h1>

        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl leading-relaxed mb-12">
          Realistic career paths, salary benchmarks, and an AI coach that knows
          your profile — built for talent across Asia.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
          <Link
            href="/signup?role=candidate"
            className="bg-primary text-primary-foreground px-8 py-3.5 rounded-md text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            I&apos;m a candidate
          </Link>
          <Link
            href="/signup?role=employer"
            className="border border-border text-foreground px-8 py-3.5 rounded-md text-sm font-semibold hover:bg-secondary transition-colors"
          >
            I&apos;m hiring
          </Link>
        </div>

        <DemoLogin />
      </section>

      {/* Feature grid */}
      <section className="px-8 pb-24">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-card border border-border rounded-lg p-6"
            >
              <div className="text-brand text-2xl mb-3">{f.icon}</div>
              <h3 className="font-heading font-semibold text-foreground mb-1.5">
                {f.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border px-8 py-6 text-center text-xs text-muted-foreground">
        Career OS &mdash; Talentbank Tech Hackathon 2026
      </footer>
    </main>
  );
}

const features = [
  {
    icon: "◈",
    title: "Career Path Navigator",
    desc: "See realistic role-to-role transitions, skill gaps, and salary deltas — across 30+ APAC career paths.",
  },
  {
    icon: "◉",
    title: "AI Career Coach",
    desc: "A coach that reads your full profile and gives context-aware next steps, not generic advice.",
  },
  {
    icon: "◐",
    title: "Fair Pay Engine",
    desc: "Know your market value. P25/P50/P75 salary benchmarks by role, location, and experience band.",
  },
  {
    icon: "◑",
    title: "Living Portfolio",
    desc: "A dynamic profile that evolves with your skills, qualifications, and projects — shareable as a public page.",
  },
  {
    icon: "◒",
    title: "Smart Talent Matching",
    desc: "For employers: describe a role in plain language, get an AI-ranked shortlist with fit explanations.",
  },
  {
    icon: "◓",
    title: "Talent Re-Engagement",
    desc: "Surface past applicants and alumni who are now a strong fit for new open roles.",
  },
];
