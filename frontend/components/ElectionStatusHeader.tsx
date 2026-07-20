"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface ElectionStatusHeaderProps {
  status: string;
}

export default function ElectionStatusHeader({
  status,
}: ElectionStatusHeaderProps) {
  const pathname = usePathname();

  const tabs = [
    { href: "/voter-application", label: "Apply as Voter" },
    { href: "/candidate-application", label: "Apply as Candidate" },
    { href: "/voting", label: "Vote" },
    { href: "/results", label: "Results" },
  ];

  return (
    <div className="mb-8">
      {/* Notice banner */}
      <Link href="/home" className="block">
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-md mb-6"
        style={{ background: "var(--sky)", borderLeft: "4px solid var(--blue)" }}
      >
        <div>
          <p className="text-xs font-semibold tracking-wide uppercase" style={{ color: "var(--blue)" }}>
            Current Election Status
          </p>
          <p className="font-display font-bold text-lg" style={{ color: "var(--Red)" }}>
            {status}
          </p>
        </div>
      </div>
      </Link>

      {/* Tabs */}
      <nav className="flex gap-2 border-b" style={{ borderColor: "var(--border)" }}>
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="px-4 py-2.5 -mb-px text-sm font-medium rounded-t-md transition-colors"
              style={{
                borderBottom: active ? "2px solid var(--blue)" : "2px solid transparent",
                color: active ? "var(--navy)" : "var(--muted)",
                background: active ? "var(--sky)" : "transparent",
              }}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}