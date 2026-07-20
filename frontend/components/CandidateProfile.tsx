"use client";

import { useAccount, useReadContract } from "wagmi";
import { electionAbi, electionAddress } from "@/lib/contract";

export default function CandidateProfile() {
  const { address } = useAccount();

  const { data: voterData } = useReadContract({
    address: electionAddress,
    abi: electionAbi,
    functionName: "voters",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: candidates } = useReadContract({
    address: electionAddress,
    abi: electionAbi,
    functionName: "getAllCandidates",
  });

  const myVoterId = voterData?.[3];
  const myCandidate = candidates?.find((c) => c.voterId === myVoterId);

  if (!myVoterId || !myCandidate) return null;

  return (
    <div
      className="rounded-lg border mt-8"
      style={{ borderColor: "var(--border)", background: "var(--card)" }}
    >
      <div className="px-8 py-6 border-b" style={{ borderColor: "var(--border)" }}>
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--blue)" }}>
          Active Registration
        </p>
        <h2 className="font-display font-bold text-xl mt-1" style={{ color: "var(--text)" }}>
          Your Candidate Profile
        </h2>
      </div>
      <div className="px-8 py-6 grid grid-cols-2 gap-6">
        <div>
          <p className="text-xs uppercase" style={{ color: "var(--muted)" }}>Candidate ID</p>
          <p className="font-mono text-sm mt-1" style={{ color: "var(--text)" }}>{myCandidate.id.toString()}</p>
        </div>
        <div>
          <p className="text-xs uppercase" style={{ color: "var(--muted)" }}>Party Name</p>
          <p className="text-sm mt-1" style={{ color: "var(--text)" }}>{myCandidate.name}</p>
        </div>
        <div>
          <p className="text-xs uppercase" style={{ color: "var(--muted)" }}>Symbol</p>
          <p className="text-sm mt-1" style={{ color: "var(--text)" }}>{myCandidate.symbol}</p>
        </div>
        <div>
          <p className="text-xs uppercase" style={{ color: "var(--muted)" }}>Live Vote Count</p>
          <p className="font-mono text-lg font-bold mt-1" style={{ color: "var(--blue)" }}>{myCandidate.voteCount.toString()}</p>
        </div>
      </div>
    </div>
  );
}