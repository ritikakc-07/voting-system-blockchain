import Link from "next/link";
import ElectionStatusHeader from "@/components/ElectionStatusHeader";
import ArchiveSection from "@/components/ArchiveSection";

export default function HomePage() {
  const electionInfo = { date: "2026-08-15", time: "09:00 AM – 05:00 PM" };

  return (
    <div>
      <ElectionStatusHeader status="Election Open for Registration" />

      <div
        className="rounded-lg border px-8 py-6 flex items-center justify-between"
        style={{ borderColor: "var(--border)", background: "var(--card)" }}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
            Election Date &amp; Time
          </p>
          <p className="font-display font-bold text-lg mt-1" style={{ color: "var(--text)" }}>
            {electionInfo.date} · {electionInfo.time}
          </p>
        </div>
        <Link
          href="/voter-list"
          className="px-5 py-2.5 rounded-md text-sm font-semibold text-white shrink-0"
          style={{ background: "var(--blue)" }}
        >
          View voter list →
        </Link>
      </div>

      <div className="mt-14">
        <ArchiveSection />
      </div>
    </div>
  );
}