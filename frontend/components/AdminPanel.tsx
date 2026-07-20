"use client";

import { useState, useEffect } from "react";
import { useConnect, useReadContract, useWriteContract, useWaitForTransactionReceipt, useConnection } from "wagmi";
import { electionAbi, electionAddress, ELECTION_STATES } from "@/lib/contract";

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border mb-6" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
      <div className="px-8 py-6 border-b" style={{ borderColor: "var(--border)" }}>
        <h2 className="font-display font-bold text-xl" style={{ color: "var(--text)" }}>{title}</h2>
        {subtitle && <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{subtitle}</p>}
      </div>
      <div className="px-8 py-8">{children}</div>
    </div>
  );
}

function inputStyle() {
  return {
    borderColor: "var(--border)",
    background: "var(--bg)",
    color: "var(--text)",
  };
}

function ElectionStateControl() {
  const { data: state, refetch } = useReadContract({
    address: electionAddress,
    abi: electionAbi,
    functionName: "state",
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) refetch();
  }, [isSuccess, refetch]);

  const handleChange = (newState: number) => {
    writeContract({
      address: electionAddress,
      abi: electionAbi,
      functionName: "setElectionState",
      args: [newState],
    });
  };

  return (
    <Card title="Election State" subtitle="Controls which actions are currently allowed on-chain.">
      <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
        Current state:{" "}
        <span className="font-mono font-semibold" style={{ color: "var(--blue)" }}>
          {state !== undefined ? ELECTION_STATES[state] : "Loading..."}
        </span>
      </p>
      <div className="flex gap-3 flex-wrap">
        {ELECTION_STATES.map((label, i) => (
          <button
            key={label}
            onClick={() => handleChange(i)}
            disabled={isPending || isConfirming}
            className="px-4 py-2 rounded-md text-sm font-semibold border transition-colors disabled:opacity-60"
            style={{
              borderColor: "var(--border)",
              background: state === i ? "var(--blue)" : "transparent",
              color: state === i ? "white" : "var(--text)",
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {(isPending || isConfirming) && (
        <p className="text-xs mt-3" style={{ color: "var(--muted)" }}>Confirming transaction...</p>
      )}
    </Card>
  );
}

function RegisterVoterForm() {
  const [form, setForm] = useState({ address: "", name: "", citizenshipNumber: "" });
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    writeContract({
      address: electionAddress,
      abi: electionAbi,
      functionName: "registerVoter",
      args: [form.address as `0x${string}`, form.name, form.citizenshipNumber],
    });
  };

  return (
    <Card title="Register Voter" subtitle="Run this after completing off-chain KYC for the applicant.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--text)" }}>Wallet Address</label>
          <input
            type="text"
            required
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="0x..."
            className="w-full px-4 py-3 rounded-md border text-sm font-mono"
            style={inputStyle()}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--text)" }}>Full Name</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3 rounded-md border text-sm"
            style={inputStyle()}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--text)" }}>Citizenship Number</label>
          <input
            type="text"
            required
            value={form.citizenshipNumber}
            onChange={(e) => setForm({ ...form, citizenshipNumber: e.target.value })}
            className="w-full px-4 py-3 rounded-md border text-sm"
            style={inputStyle()}
          />
        </div>
        <button
          type="submit"
          disabled={isPending || isConfirming}
          className="px-6 py-3 rounded-md text-sm font-semibold text-white disabled:opacity-60"
          style={{ background: "var(--blue)" }}
        >
          {isPending ? "Confirm in wallet..." : isConfirming ? "Registering..." : "Register Voter"}
        </button>
        {isSuccess && <p className="text-sm" style={{ color: "var(--verified)" }}>✓ Voter registered on-chain.</p>}
        {error && <p className="text-sm" style={{ color: "var(--Red)" }}>{error.message.split("\n")[0]}</p>}
      </form>
    </Card>
  );
}

function AddCandidateForm() {
  const [voterAddress, setVoterAddress] = useState("");
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");

  const { data: voterData, refetch, isFetching } = useReadContract({
    address: electionAddress,
    abi: electionAbi,
    functionName: "voters",
    args: voterAddress ? [voterAddress as `0x${string}`] : undefined,
    query: { enabled: false },
  });

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    await refetch();
  };

  const handleAdd = () => {
    if (!voterData?.[3]) return;
    writeContract({
      address: electionAddress,
      abi: electionAbi,
      functionName: "addCandidate",
      args: [name, symbol, voterData[3]],
    });
  };

  const isRegistered = voterData?.[0];

  return (
    <Card title="Add Candidate" subtitle="Look up the applicant's Voter ID first, then finalize their candidacy.">
      <form onSubmit={handleLookup} className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--text)" }}>Candidate&apos;s Wallet Address</label>
          <div className="flex gap-2">
            <input
              type="text"
              required
              value={voterAddress}
              onChange={(e) => setVoterAddress(e.target.value)}
              placeholder="0x..."
              className="flex-1 px-4 py-3 rounded-md border text-sm font-mono"
              style={inputStyle()}
            />
            <button
              type="submit"
              disabled={isFetching}
              className="px-5 py-3 rounded-md text-sm font-semibold border"
              style={{ borderColor: "var(--border)", color: "var(--text)" }}
            >
              {isFetching ? "Looking up..." : "Look Up"}
            </button>
          </div>
        </div>
      </form>

      {voterData && (
        <div className="mb-6 p-4 rounded-md border" style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
          {isRegistered ? (
            <>
              <p className="text-sm" style={{ color: "var(--verified)" }}>✓ Registered voter: {voterData[4]}</p>
              <p className="font-mono text-xs mt-1 break-all" style={{ color: "var(--muted)" }}>{voterData[3]}</p>
            </>
          ) : (
            <p className="text-sm" style={{ color: "var(--Red)" }}>This address is not a registered voter.</p>
          )}
        </div>
      )}

      {isRegistered && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text)" }}>Party Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-md border text-sm"
              style={inputStyle()}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text)" }}>Symbol</label>
            <input
              type="text"
              required
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full px-4 py-3 rounded-md border text-sm"
              style={inputStyle()}
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={isPending || isConfirming || !name || !symbol}
            className="px-6 py-3 rounded-md text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: "var(--blue)" }}
          >
            {isPending ? "Confirm in wallet..." : isConfirming ? "Adding..." : "Add Candidate"}
          </button>
          {isSuccess && <p className="text-sm" style={{ color: "var(--verified)" }}>✓ Candidate added on-chain.</p>}
          {error && (
            <p className="text-sm" style={{ color: "var(--Red)" }}>
              {error.message.includes("revert")
                ? "This party name or symbol may already be in use, or the contract rejected the request."
                : error.message.split("\n")[0]}
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

export default function AdminPanel() {
  const { address, isConnected } = useConnection();

  const { data: owner, isLoading } = useReadContract({
    address: electionAddress,
    abi: electionAbi,
    functionName: "owner",
  });

  if (!isConnected) {
    return (
      <Card title="Admin Panel">
        <p className="text-sm" style={{ color: "var(--muted)" }}>Connect your wallet to access the admin panel.</p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card title="Admin Panel">
        <p className="text-sm" style={{ color: "var(--muted)" }}>Checking permissions...</p>
      </Card>
    );
  }

  const isOwner = owner && address && owner.toLowerCase() === address.toLowerCase();

  if (!isOwner) {
    return (
      <Card title="Admin Panel">
        <p className="text-sm" style={{ color: "var(--Red)" }}>
          Access denied. Only the Election Commission wallet can access this page.
        </p>
      </Card>
    );
  }

  return (
    <div>
      <ElectionStateControl />
      <RegisterVoterForm />
      <AddCandidateForm />
    </div>
  );
}