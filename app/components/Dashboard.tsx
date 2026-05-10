"use client";

import { useEffect, useState } from "react";

const API_BASE = "https://mintto-api-c493341a60c4.herokuapp.com";

interface Member {
  display_name: string;
  wallet_address: string;
  total_deposited: string;
  status: string;
}

interface GroupStatus {
  id: string;
  name: string;
  weekly_amount: string;
  total_weeks: number;
  current_week: number;
  total_deposited: string;
  vault_pda: string | null;
  members: Member[];
  goal: number;
  progress: number;
}

export default function Dashboard({ walletAddress }: { walletAddress: string }) {
  const [group, setGroup] = useState<GroupStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const shortAddress = walletAddress.slice(0, 4) + "..." + walletAddress.slice(-4);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/groups/${walletAddress}`);
        const groups = await res.json();
        if (groups.length > 0) {
          const statusRes = await fetch(`${API_BASE}/api/groups/${groups[0].id}/status`);
          const status = await statusRes.json();
          setGroup(status);
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    load();
  }, [walletAddress]);

  function formatAmount(lamports: number | string) {
    const val = Number(lamports) / 1_000_000;
    return val.toLocaleString();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-[#7c3aed] font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] max-w-md mx-auto px-5 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#60a5fa] to-[#818cf8] flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {shortAddress[0].toUpperCase()}
            </span>
          </div>
          <h1 className="text-xl font-bold text-[#1a1a2e]">Hello {shortAddress}!</h1>
        </div>
        <div className="w-9 h-9 rounded-full bg-[#f3f4f6] flex items-center justify-center">
          <span className="text-lg">🔔</span>
        </div>
      </div>

      {/* Balance Card */}
      <div className="rounded-2xl bg-gradient-to-br from-[#93c5fd] via-[#c4b5fd] to-[#fbcfe8] p-5 mb-6">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-[#1a1a2e]/70">Shared Balance</span>
          <span className="text-sm font-medium text-[#1a1a2e]/70">
            week: {group?.current_week || 0}
          </span>
        </div>
        <p className="text-3xl font-bold text-[#1a1a2e] mb-4">
          {group ? formatAmount(group.total_deposited) : "0"} UGX
        </p>
        <div className="w-full bg-white/30 rounded-full h-2 mb-2">
          <div
            className="bg-[#7c3aed] h-2 rounded-full transition-all"
            style={{ width: `${group?.progress || 0}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-[#4b5563]">
          <span>{group?.progress || 0}%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Status */}
      <h2 className="text-lg font-semibold text-[#1a1a2e] mb-4">Status</h2>
      <div className="flex justify-around mb-8">
        {group?.members.map((member, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <span className="text-sm font-medium text-[#1a1a2e]">
              {member.wallet_address === walletAddress ? "Me" : member.display_name}
            </span>
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                i === 0
                  ? "bg-gradient-to-br from-[#60a5fa] to-[#818cf8]"
                  : "bg-gradient-to-br from-[#fbbf24] to-[#f97316]"
              }`}
            >
              {member.display_name[0].toUpperCase()}
            </div>
            <span
              className={`text-xs font-medium px-3 py-1 rounded-full border ${
                member.status === "paid"
                  ? "bg-[#ecfdf5] text-[#059669] border-[#10b981]"
                  : "bg-[#fffbeb] text-[#d97706] border-[#fbbf24]"
              }`}
            >
              {member.status === "paid" ? "Paid" : "Pending"}
            </span>
          </div>
        ))}
        {(!group || group.members.length === 0) && (
          <>
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm font-medium">Me</span>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#60a5fa] to-[#818cf8] flex items-center justify-center text-white font-bold">
                E
              </div>
              <span className="text-xs font-medium px-3 py-1 rounded-full border bg-[#fffbeb] text-[#d97706] border-[#fbbf24]">
                Pending
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm font-medium">Partner</span>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#fbbf24] to-[#f97316] flex items-center justify-center text-white font-bold">
                ?
              </div>
              <span className="text-xs font-medium px-3 py-1 rounded-full border bg-[#f3f4f6] text-[#6b7280] border-[#d1d5db]">
                Invite
              </span>
            </div>
          </>
        )}
      </div>

      {/* Deposit CTA */}
      <div className="text-center mb-8">
        <p className="text-[#6b7280] text-sm mb-3">ready to pay your weekly?</p>
        <button className="w-full py-4 bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] text-white font-bold text-base rounded-xl hover:opacity-90 transition">
          Deposit Now
        </button>
      </div>

      {/* Activity Feed */}
      <h2 className="text-lg font-semibold text-[#1a1a2e] mb-4">Activity Feed</h2>
      <div className="bg-white rounded-2xl border border-black/5 p-4 space-y-4">
        {[1, 2, 3].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#fbbf24] to-[#f97316] flex items-center justify-center text-white text-xs font-bold">
              D
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#1a1a2e]">+ ugx 2000-usdc</p>
              <p className="text-xs text-[#2563eb]">View on solana</p>
            </div>
            <span className="text-xs text-[#6b7280]">
              {i === 1 ? "03.Tue" : "Today"}
            </span>
            <span className="text-[#9945ff] text-sm">◎</span>
          </div>
        ))}
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-black/5 py-3 px-6">
        <div className="max-w-md mx-auto flex justify-around">
          {["Home", "Vault", "Activity", "Profile"].map((tab, i) => (
            <button
              key={tab}
              className={`flex flex-col items-center gap-1 text-xs ${
                i === 0 ? "text-[#7c3aed] font-semibold" : "text-[#6b7280]"
              }`}
            >
              <span className="text-lg">
                {["🏠", "🏦", "📋", "👤"][i]}
              </span>
              {tab}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
