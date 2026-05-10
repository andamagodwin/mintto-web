"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const API_BASE = "https://mintto-api-c493341a60c4.herokuapp.com";

interface GroupInfo {
  id: string;
  name: string;
  weekly_amount: string;
  total_weeks: number;
  members: { display_name: string; wallet_address: string; status: string }[];
  goal: number;
  progress: number;
}

export default function JoinPage() {
  const params = useParams();
  const groupId = params.groupId as string;
  const [group, setGroup] = useState<GroupInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/groups/${groupId}/status`);
        if (res.ok) setGroup(await res.json());
        else setError("Group not found");
      } catch {
        setError("Failed to load group");
      }
      setLoading(false);
    }
    load();
  }, [groupId]);

  async function connectAndJoin() {
    setJoining(true);
    setError(null);
    try {
      if (!(window as any).solana) {
        window.open("https://phantom.app/", "_blank");
        setJoining(false);
        return;
      }

      const provider = (window as any).solana;
      const resp = await provider.connect();
      const address = resp.publicKey.toString();
      setWalletAddress(address);

      // Register user
      await fetch(`${API_BASE}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: address,
          displayName: address.slice(0, 4) + "..." + address.slice(-4),
        }),
      }).catch(() => {});

      // Join group
      const joinRes = await fetch(`${API_BASE}/api/groups/${groupId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address }),
      });

      if (joinRes.ok) {
        setJoined(true);
      } else {
        const data = await joinRes.json();
        setError(data.error || "Failed to join group");
      }
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    }
    setJoining(false);
  }

  function formatUsdc(lamports: number | string) {
    return (Number(lamports) / 1_000_000).toLocaleString(undefined, { minimumFractionDigits: 2 });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9fafb]">
        <p className="text-[#7c3aed] font-semibold animate-pulse">Loading...</p>
      </div>
    );
  }

  if (error && !group) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9fafb]">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <a href="/" className="text-[#7c3aed] hover:underline">Go to Mintto</a>
        </div>
      </div>
    );
  }

  if (joined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#93c5fd] via-[#c4b5fd] to-[#fbcfe8]">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-sm text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-[#1a1a2e] mb-2">You&apos;re in!</h1>
          <p className="text-[#6b7280] mb-6">
            You&apos;ve joined <strong>{group?.name}</strong>. Start saving together!
          </p>
          <a
            href="/"
            className="inline-block w-full py-3 bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] text-white font-semibold rounded-xl hover:opacity-90 transition"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#93c5fd] via-[#c4b5fd] to-[#fbcfe8]">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-sm w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">M</span>
          </div>
          <h1 className="text-xl font-bold text-[#1a1a2e]">You&apos;re invited to join</h1>
        </div>

        <div className="bg-[#f9fafb] rounded-xl p-4 mb-6">
          <h2 className="font-bold text-lg text-[#1a1a2e] mb-2">{group?.name}</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#6b7280]">Weekly deposit</span>
              <span className="font-semibold">{formatUsdc(group?.weekly_amount || 0)} USDC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6b7280]">Duration</span>
              <span className="font-semibold">{group?.total_weeks} weeks</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6b7280]">Members</span>
              <span className="font-semibold">{group?.members.length}</span>
            </div>
          </div>
        </div>

        {group?.members && group.members.length > 0 && (
          <div className="mb-6">
            <p className="text-xs text-[#6b7280] mb-2">Current members:</p>
            <div className="space-y-2">
              {group.members.map((m, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#60a5fa] to-[#818cf8] flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{m.display_name[0].toUpperCase()}</span>
                  </div>
                  <span className="text-sm text-[#1a1a2e]">{m.display_name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

        <button
          onClick={connectAndJoin}
          disabled={joining}
          className="w-full py-4 bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] text-white font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50"
        >
          {joining ? "Connecting..." : "Connect Wallet & Join"}
        </button>

        <p className="text-xs text-[#9ca3af] text-center mt-4">
          You&apos;ll need Phantom wallet with devnet USDC
        </p>
      </div>
    </div>
  );
}
