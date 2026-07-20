"use client";

import { useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { electionAbi, electionAddress, ELECTION_STATES } from "@/lib/contract";
import SealMark from "@/components/SealMark";

export default function VotingBallot() {
  const { address, isConnected } = useAccount();

  const { data: state } = useReadContract({
    address: electionAddress,
    abi: electionAbi,
    functionName: "state",
  });

  const { data: voterData, refetch: refetchVoter } = useReadContract({
    address: electionAddress,
    abi: electionAbi,
    functionName: "voters",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: candidates, refetch: refetchCandidates } = useReadContract({
    address: electionAddress,
    abi: electionAbi,
    functionName: "getAllCandidates",
  });

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) {
      refetchVoter();
      refetchCandidates();
    }
  }, [isSuccess, refetchVoter, refetchCandidates]);

  const card = (children: React.ReactNode) => (
    <div className="rounded-lg border" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
      <div className="px-8 py-6 border-b" style={{ borderColor: "var(--border)" }}>
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--blue)" }}>
          Cast Your Vote
        </p>
        <h2 className="font-display font-bold text-xl mt-1" style={{ color: "var(--text)" }}>
          Election Ballot
        </h2>
      </div>
      <div className="px-8 py-10">{children}</div>
    </div>
  );

  if (!isConnected) {
    return card(
      <p className="text-sm text-center" style={{ color: "var(--muted)" }}>
        Connect your wallet to vote.
      </p>
    );
  }

  if (state !== undefined && state !== 2) {
    return card(
      <p className="text-sm text-center" style={{ color: "var(--muted)" }}>
        Voting is not currently active. Current state:{" "}
        <span className="font-mono" style={{ color: "var(--blue)" }}>{ELECTION_STATES[state]}</span>
      </p>
    );
  }

  if (voterData && !voterData[0]) {
    return card(
      <p className="text-sm text-center" style={{ color: "var(--Red)" }}>
        You are not a registered voter. Please complete registration with the Election Commission first.
      </p>
    );
  }

  if (voterData && voterData[1]) {
    const votedCandidate = candidates?.find((c) => c.id === voterData[2]);
    return card(
      <div className="flex flex-col items-center text-center">
        <SealMark size={56} />
        <p className="mt-4 verified-badge">✓ Vote Recorded</p>
        <p className="text-sm mt-6" style={{ color: "var(--muted)" }}>You voted for</p>
        <p className="font-display font-bold text-lg mt-1" style={{ color: "var(--text)" }}>
          {votedCandidate ? `${votedCandidate.name} — ${votedCandidate.symbol}` : "—"}
        </p>
        <p className="text-xs mt-6 max-w-xs" style={{ color: "var(--muted)" }}>
          Each wallet may vote only once. Your vote has been permanently recorded on-chain.
        </p>
      </div>
    );
  }

  if (!candidates || candidates.length === 0) {
    return card(
      <p className="text-sm text-center" style={{ color: "var(--muted)" }}>
        No candidates have been added yet.
      </p>
    );
  }

  return card(
    <div className="space-y-3">
      {candidates.map((c) => (
        <div
          key={c.id.toString()}
          className="flex items-center justify-between px-5 py-4 rounded-md border"
          style={{ borderColor: "var(--border)", background: "var(--bg)" }}
        >
          <div>
            <p className="font-display font-bold text-base" style={{ color: "var(--text)" }}>
              {c.name}
            </p>
            <p className="text-sm" style={{ color: "var(--muted)" }}>{c.symbol}</p>
          </div>
          <button
            onClick={() =>
              writeContract({
                address: electionAddress,
                abi: electionAbi,
                functionName: "castVote",
                args: [c.id],
              })
            }
            disabled={isPending || isConfirming}
            className="px-5 py-2.5 rounded-md text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: "var(--blue)" }}
          >
            {isPending || isConfirming ? "Voting..." : "Vote"}
          </button>
        </div>
      ))}

      {error && (
        <p className="text-sm mt-2" style={{ color: "var(--Red)" }}>
          {error.message.split("\n")[0]}
        </p>
      )}
    </div>
  );
}
