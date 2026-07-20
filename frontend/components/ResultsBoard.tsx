"use client";

import { useReadContract } from "wagmi";
import { electionAbi, electionAddress, ELECTION_STATES } from "@/lib/contract";

export default function ResultsBoard() {
  const { data: state } = useReadContract({
    address: electionAddress,
    abi: electionAbi,
    functionName: "state",
    query: { refetchInterval: 5000 },
  });

  const { data: candidates, isLoading } = useReadContract({
    address: electionAddress,
    abi: electionAbi,
    functionName: "getAllCandidates",
    query: { refetchInterval: 5000 },
  });

  const sorted = candidates
    ? [...candidates].sort((a, b) => Number(b.voteCount) - Number(a.voteCount))
    : [];

  const totalVotes = sorted.reduce((sum, c) => sum + Number(c.voteCount), 0);
  const leaderId = sorted[0]?.id;

  return (
    <div className="rounded-lg border" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
      <div className="px-8 py-6 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--blue)" }}>
            Live Results
          </p>
          <h2 className="font-display font-bold text-xl mt-1" style={{ color: "var(--text)" }}>
            Election Results
          </h2>
        </div>
        {state !== undefined && (
          <span
            className="font-mono text-xs px-3 py-1.5 rounded-full border"
            style={{ borderColor: "var(--border)", color: "var(--muted)" }}
          >
            {ELECTION_STATES[state]}
          </span>
        )}
      </div>

      <div className="px-8 py-8">
        {isLoading ? (
          <p className="text-sm text-center" style={{ color: "var(--muted)" }}>Loading results...</p>
        ) : sorted.length === 0 ? (
          <p className="text-sm text-center" style={{ color: "var(--muted)" }}>No candidates yet.</p>
        ) : (
          <div className="space-y-4">
            {sorted.map((c) => {
              const pct = totalVotes > 0 ? (Number(c.voteCount) / totalVotes) * 100 : 0;
              const isLeader = c.id === leaderId && Number(c.voteCount) > 0;
              return (
                <div key={c.id.toString()}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium flex items-center gap-2" style={{ color: "var(--text)" }}>
                      {c.name} <span style={{ color: "var(--muted)" }}>· {c.symbol}</span>
                      {isLeader && (
                        <span
                          className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(34,197,94,0.12)", color: "var(--verified)" }}
                        >
                          Leading
                        </span>
                      )}
                    </p>
                    <p className="font-mono text-sm font-semibold" style={{ color: "var(--blue)" }}>
                      {c.voteCount.toString()} votes
                    </p>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--bg)" }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: "var(--blue)" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-xs mt-6 text-center" style={{ color: "var(--muted)" }}>
          Total votes cast: <span className="font-mono">{totalVotes}</span> — updates automatically every few seconds
        </p>
      </div>
    </div>
  );
}
