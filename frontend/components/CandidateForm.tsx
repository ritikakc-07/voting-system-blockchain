"use client";

import { useState } from "react";
import Link from "next/link";
import { useAccount, useReadContract } from "wagmi";
import { zeroAddress } from "viem";
import SealMark from "@/components/SealMark";
import { electionAbi, electionAddress } from "@/lib/contract";

export default function CandidateForm() {
  const { address } = useAccount();
  const [formData, setFormData] = useState({ voterId: "", partyName: "", symbol: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkedVoterId, setCheckedVoterId] = useState<`0x${string}` | undefined>();

  const { data: resolvedAddress, isFetching } = useReadContract({
    address: electionAddress,
    abi: electionAbi,
    functionName: "voterIdToAddress",
    args: checkedVoterId ? [checkedVoterId] : undefined,
    query: { enabled: !!checkedVoterId },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.voterId.startsWith("0x") || formData.voterId.length !== 66) {
      setError("Voter ID must be a valid 32-byte hash (0x... 64 hex characters).");
      return;
    }

    setCheckedVoterId(formData.voterId as `0x${string}`);
  };

  // After the read resolves, decide outcome
  if (checkedVoterId && !isFetching && resolvedAddress !== undefined && !submitted && !error) {
    if (resolvedAddress === zeroAddress) {
      setError("Invalid Voter ID. You must be a registered voter to apply.");
      setCheckedVoterId(undefined);
    } else if (address && resolvedAddress.toLowerCase() !== address.toLowerCase()) {
      setError("This Voter ID does not belong to your connected wallet.");
      setCheckedVoterId(undefined);
    } else {
      setSubmitted(true);
    }
  }

  return (
    <div className="rounded-lg border" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
      <div className="px-8 py-6 border-b" style={{ borderColor: "var(--border)" }}>
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--blue)" }}>
          Section 2
        </p>
        <h2 className="font-display font-bold text-xl mt-1" style={{ color: "var(--text)" }}>
          Candidate Application
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          Requires a verified Voter ID issued after voter registration. Applications are reviewed and finalized on-chain by the Election Commission.
        </p>
      </div>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text)" }}>
              Voter ID <span style={{ color: "var(--muted)" }}>(provided by ECN)</span>
            </label>
            <input
              type="text"
              name="voterId"
              value={formData.voterId}
              onChange={handleChange}
              required
              placeholder="0x..."
              className="w-full px-4 py-3 rounded-md border text-sm font-mono focus:outline-none focus:ring-2"
              style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text)" }}>Party Name</label>
            <input
              type="text"
              name="partyName"
              value={formData.partyName}
              onChange={handleChange}
              required
              placeholder="Enter your party name"
              className="w-full px-4 py-3 rounded-md border text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text)" }}>Symbol</label>
            <input
              type="text"
              name="symbol"
              value={formData.symbol}
              onChange={handleChange}
              required
              placeholder="Enter your party symbol"
              className="w-full px-4 py-3 rounded-md border text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }}
            />
          </div>

          {error && (
            <p className="text-sm" style={{ color: "var(--Red)" }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={isFetching}
            className="px-6 py-3 rounded-md text-sm font-semibold text-white transition-colors disabled:opacity-60"
            style={{ background: "var(--blue)" }}
          >
            {isFetching ? "Verifying Voter ID..." : "Submit Application"}
          </button>
        </form>
      ) : (
        <div className="px-8 py-10 flex flex-col items-center text-center">
          <SealMark size={56} />
          <p className="mt-4 verified-badge">✓ Application Submitted</p>
          <p className="text-sm mt-6" style={{ color: "var(--muted)" }}>Party</p>
          <p className="font-display font-bold text-lg mt-1" style={{ color: "var(--text)" }}>
            {formData.partyName} — {formData.symbol}
          </p>
          <p className="text-xs mt-6 max-w-xs" style={{ color: "var(--muted)" }}>
            Your application will be reviewed and finalized on-chain by the Election Commission.
          </p>
          <Link
            href="/home"
            className="mt-6 px-5 py-2 rounded-md text-sm font-semibold border transition-colors"
            style={{ borderColor: "var(--border)", color: "var(--text)" }}
          >
            Exit
          </Link>
        </div>
      )}
    </div>
  );
}