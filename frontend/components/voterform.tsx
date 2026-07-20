"use client";

import { useAccount, useReadContract } from "wagmi";
import { electionAbi, electionAddress } from "@/lib/contract";
import SealMark from "@/components/SealMark";

export default function VoterStatus() {
  const { address, isConnected } = useAccount();

  const { data, isLoading } = useReadContract({
    address: electionAddress,
    abi: electionAbi,
    functionName: "voters",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const card = (children: React.ReactNode) => (
    <div
      className="rounded-lg border"
      style={{ borderColor: "var(--border)", background: "var(--card)" }}
    >
      <div className="px-8 py-6 border-b" style={{ borderColor: "var(--border)" }}>
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--blue)" }}>
          Section 1
        </p>
        <h2 className="font-display font-bold text-xl mt-1" style={{ color: "var(--text)" }}>
          Voter Registration Status
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          Registration is completed in person by the Election Commission after KYC.
        </p>
      </div>
      <div className="px-8 py-10 flex flex-col items-center text-center">{children}</div>
    </div>
  );

  if (!isConnected) {
    return card(
      <p className="text-sm" style={{ color: "var(--muted)" }}>
        Connect your wallet to check your voter registration status.
      </p>
    );
  }

  if (isLoading) {
    return card(<p className="text-sm" style={{ color: "var(--muted)" }}>Checking status...</p>);
  }

  const [isRegistered, , , voterId, name] = data ?? [false, false, BigInt(0), "0x0", ""];

  if (!isRegistered) {
    return card(
      <>
        <p className="verified-badge" style={{ background: "rgba(239,68,68,0.12)", color: "var(--Red)", borderColor: "rgba(239,68,68,0.3)" }}>
          Not Registered
        </p>
        <p className="text-sm mt-4 max-w-xs" style={{ color: "var(--muted)" }}>
          You are not yet a registered voter. Please visit your local Election Commission office with valid citizenship documents to complete KYC and registration.
        </p>
      </>
    );
  }

  return (
    <>
      <SealMark size={56} />
      <p className="mt-4 verified-badge">✓ Registered Voter</p>

      <p className="text-sm mt-6" style={{ color: "var(--muted)" }}>
        Registered as
      </p>
      <p className="font-display font-bold text-lg mt-1" style={{ color: "var(--text)" }}>
        {name}
      </p>

      <p className="text-sm mt-6" style={{ color: "var(--muted)" }}>
        Your Voter ID
      </p>
      <p
        className="font-mono text-sm mt-2 px-4 py-3 rounded-md border break-all"
        style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }}
      >
        {voterId}
      </p>

      <p className="text-xs mt-6 max-w-xs" style={{ color: "var(--muted)" }}>
        Save this ID — you&apos;ll need it to apply as a candidate.
      </p>
    </>
  );
}