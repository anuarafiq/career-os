"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/employer/dashboard", label: "Dashboard", icon: "⊟" },
  { href: "/employer/jobs",      label: "Jobs",       icon: "◑" },
  { href: "/employer/search",    label: "Find Talent", icon: "◒" },
  { href: "/employer/pipeline",  label: "Pipeline", icon: "◓" },
  { href: "/employer/re-engage", label: "Re-Engage", icon: "◐" },
];

export function EmployerSidebar({
  companyName,
  email,
}: {
  companyName: string;
  email: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-56 shrink-0 border-r border-border flex flex-col h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-border">
        <span className="font-heading text-lg font-semibold">
          Career<span className="text-brand">OS</span>
        </span>
        <p className="text-xs text-muted-foreground mt-0.5">Employer</p>
      </div>

      <nav className="flex-1 py-4 px-3 flex flex-col gap-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all",
                isActive
                  ? "bg-brand-subtle text-brand font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-brand-subtle flex items-center justify-center text-brand text-xs font-bold shrink-0">
            {companyName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{companyName}</p>
            <p className="text-xs text-muted-foreground truncate">{email}</p>
          </div>
        </div>
        <button onClick={handleSignOut} className="w-full text-left text-xs text-muted-foreground hover:text-foreground px-3 py-2 transition-colors">
          Sign out
        </button>
      </div>
    </aside>
  );
}
