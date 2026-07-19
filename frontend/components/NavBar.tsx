"use client";

import { useState } from "react";
import Link from "next/link";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import SealMark from "./SealMark";

function WalletAddressModal({
  address,
  onClose,
  onDisconnect,
}: {
  address: string;
  onClose: () => void;
  onDisconnect: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-lg border p-6"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-lg" style={{ color: "var(--text)" }}>
            Wallet Connected
          </h3>
          <button
            onClick={onClose}
            className="text-sm"
            style={{ color: "var(--muted)" }}
          >
            ✕
          </button>
        </div>

        <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--muted)" }}>
          Public Address
        </p>
        <p
          className="font-mono text-sm px-4 py-3 rounded-md border break-all mb-6"
          style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }}
        >
          {address}
        </p>

        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 px-4 py-2.5 rounded-md text-sm font-semibold text-white transition-colors"
            style={{ background: "var(--blue)" }}
          >
            {copied ? "Copied!" : "Copy Address"}
          </button>
          <button
            onClick={() => {
              onDisconnect();
              onClose();
            }}
            className="flex-1 px-4 py-2.5 rounded-md text-sm font-semibold border transition-colors"
            style={{ borderColor: "var(--border)", color: "var(--text)" }}
          >
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
}

function ConnectWalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [modalOpen, setModalOpen] = useState(false);

  if (isConnected && address) {
    return (
      <>
        <button
          onClick={() => setModalOpen(true)}
          className="rounded-md border px-4 py-2 font-mono text-sm font-medium text-white transition-colors"
          style={{ borderColor: "var(--blue)" }}
        >
          {address.slice(0, 6)}...{address.slice(-4)}
        </button>

        {modalOpen && (
          <WalletAddressModal
            address={address}
            onClose={() => setModalOpen(false)}
            onDisconnect={() => disconnect()}
          />
        )}
      </>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: connectors[0] })}
      disabled={isPending}
      className="rounded-md px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-60"
      style={{ background: "var(--blue)" }}
    >
      {isPending ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}

export function NavBar() {
  return (
    <header
      className="flex items-center justify-between gap-4 border-b px-5 py-4 md:px-8"
      style={{ borderColor: "var(--border)", background: "var(--navy)" }}
    >
      <Link href="/home" className="flex min-w-0 items-center gap-3">
        <SealMark size={32} />
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em]" style={{ color: "#A8BEDD" }}>
            Election Commission
          </p>
          <h1 className="truncate font-display text-xl font-bold tracking-tight text-white md:text-2xl">
            Blockchain Voting System
          </h1>
        </div>
      </Link>

      <ConnectWalletButton />
    </header>
  );
}

export default NavBar;