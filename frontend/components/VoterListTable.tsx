"use client";

import { useState } from "react";
import { useReadContract, useReadContracts } from "wagmi";
import { electionAbi, electionAddress } from "@/lib/contract";

export default function VoterListTable() {
  const [search, setSearch] = useState("");

  const { data: addresses, isLoading: loadingAddresses } = useReadContract({
    address: electionAddress,
    abi: electionAbi,
    functionName: "getAllVoterAddresses",
  });

  const { data: voterDetails, isLoading: loadingDetails } = useReadContracts({
    contracts: (addresses ?? []).map((addr) => ({
      address: electionAddress,
      abi: electionAbi,
      functionName: "voters",
      args: [addr],
    })),
    query: { enabled: !!addresses && addresses.length > 0 },
  });

  const voters = (addresses ?? []).map((addr, i) => {
    const result = voterDetails?.[i]?.result as
      | [boolean, boolean, bigint, string, string]
      | undefined;
    return {
      address: addr,
      name: result?.[4] ?? "—",
    };
  });

  const filtered = voters.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase())
  );

  const isLoading = loadingAddresses || loadingDetails;

  return (
    <div
      className="rounded-lg border"
      style={{ borderColor: "var(--border)", background: "var(--card)" }}
    >
      <div className="px-8 py-6 border-b flex items-center justify-between gap-4" style={{ borderColor: "var(--border)" }}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--blue)" }}>
            Public Record
          </p>
          <h2 className="font-display font-bold text-xl mt-1" style={{ color: "var(--text)" }}>
            Registered Voters
          </h2>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name"
          className="px-4 py-2.5 rounded-md border text-sm w-56"
          style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }}
        />
      </div>

      <table className="w-full text-left">
        <thead>
          <tr style={{ background: "var(--sky)" }}>
            <th className="px-8 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text)" }}>S/N</th>
            <th className="px-8 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text)" }}>Name</th>
            <th className="px-8 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text)" }}>Public Address</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={3} className="px-8 py-10 text-center text-sm" style={{ color: "var(--muted)" }}>
                Loading voters from chain...
              </td>
            </tr>
          ) : filtered.length === 0 ? (
            <tr>
              <td colSpan={3} className="px-8 py-10 text-center text-sm" style={{ color: "var(--muted)" }}>
                No voters found
              </td>
            </tr>
          ) : (
            filtered.map((v, i) => (
              <tr key={v.address} className="border-t" style={{ borderColor: "var(--border)" }}>
                <td className="px-8 py-4 text-sm" style={{ color: "var(--muted)" }}>{i + 1}</td>
                <td className="px-8 py-4 text-sm font-medium" style={{ color: "var(--text)" }}>{v.name}</td>
                <td className="px-8 py-4 text-sm font-mono" style={{ color: "var(--muted)" }}>{v.address}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}