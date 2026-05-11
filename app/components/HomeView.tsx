"use client";

import { useState } from "react";
import { depositUsdc } from "../lib/deposit";
import { useStore } from "../lib/store";
import { People, Copy, TickCircle } from "iconsax-react";

const API_BASE = "https://mintto-api-c493341a60c4.herokuapp.com";

export default function HomeView({ walletAddress }: { walletAddress: string }) {
  const { groupStatus: group, loading, refreshGroup } = useStore();
  const [creating, setCreating] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [weeklyAmount, setWeeklyAmount] = useState("2");
  const [totalWeeks, setTotalWeeks] = useState("12");
  const [depositing, setDepositing] = useState(false);
  const [depositStatus, setDepositStatus] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function createGroup() {
    setCreating(true);
    try {
      await fetch(`${API_BASE}/api/groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: groupName,
          creatorWallet: walletAddress,
          weeklyAmount: Math.round(Number(weeklyAmount) * 1_000_000),
          totalWeeks: Number(totalWeeks),
        }),
      });
      setFormOpen(false);
      setGroupName("");
      await refreshGroup(walletAddress);
    } catch (e) {
      console.error(e);
    }
    setCreating(false);
  }

  async function handleDeposit() {
    if (!group) return;
    setDepositing(true);
    setDepositStatus(null);
    try {
      const recipient = group.vault_pda || walletAddress;
      const signature = await depositUsdc({
        walletAddress,
        recipientAddress: recipient,
        amount: Number(group.weekly_amount),
      });

      await fetch(`${API_BASE}/api/transactions/record`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: group.id,
          walletAddress,
          txSignature: signature,
          amount: Number(group.weekly_amount),
          txType: "deposit",
          weekNumber: group.current_week + 1,
        }),
      });

      setDepositStatus(`Deposit successful! Tx: ${signature.slice(0, 8)}...`);
      await refreshGroup(walletAddress);
    } catch (e: any) {
      setDepositStatus(`Error: ${e.message || "Transaction failed"}`);
    }
    setDepositing(false);
  }

  function formatUsdc(lamports: number | string) {
    return (Number(lamports) / 1_000_000).toLocaleString(undefined, { minimumFractionDigits: 2 });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-[#F97316] font-semibold animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-[#1a1a2e] mb-1">Dashboard</h1>
      <p className="text-[#6b7280] mb-8">Overview of your savings groups</p>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-[#FFF7ED] via-[#FFEDD5] to-[#FED7AA] rounded-2xl p-6">
          <p className="text-sm font-medium text-[#1a1a2e]/70 mb-1">Total Saved</p>
          <p className="text-3xl font-bold text-[#1a1a2e]">
            {group ? formatUsdc(group.total_deposited) : "0.00"} <span className="text-lg">USDC</span>
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <p className="text-sm font-medium text-[#6b7280] mb-1">Current Week</p>
          <p className="text-3xl font-bold text-[#1a1a2e]">
            {group ? group.current_week : 0} <span className="text-lg text-[#6b7280]">/ {group?.total_weeks || 0}</span>
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <p className="text-sm font-medium text-[#6b7280] mb-1">Group Goal</p>
          <p className="text-3xl font-bold text-[#1a1a2e]">
            {group ? formatUsdc(group.goal) : "0.00"} <span className="text-lg">USDC</span>
          </p>
        </div>
      </div>

      {/* Progress + Members */}
      {group && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-[#1a1a2e]">{group.name}</h2>
            <span className="text-sm text-[#6b7280]">{group.progress}% complete</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 mb-4">
            <div
              className="bg-gradient-to-r from-[#F97316] to-[#EA580C] h-3 rounded-full transition-all"
              style={{ width: `${group.progress}%` }}
            />
          </div>

          {/* Invite */}
          <div className="flex items-center justify-between mb-4 p-3 bg-[#FFF7ED] rounded-xl">
            <div className="flex items-center gap-2">
              <People size={18} color="#F97316" variant="Bold" />
              <span className="text-sm font-medium text-[#EA580C]">Invite a friend to this group</span>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/join/${group.id}`);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#F97316] text-white text-xs font-medium rounded-lg hover:opacity-90 transition"
            >
              {copied ? <TickCircle size={14} color="#fff" /> : <Copy size={14} color="#fff" />}
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>

          {/* Members */}
          <h3 className="text-sm font-semibold text-[#1a1a2e] mb-3">Members</h3>
          <div className="space-y-3">
            {group.members.map((member, i) => (
              <div key={i} className="flex items-center justify-between py-2 px-4 bg-[#f9fafb] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    i === 0 ? "bg-gradient-to-br from-[#F97316] to-[#EA580C]" : "bg-gradient-to-br from-[#F59E0B] to-[#D97706]"
                  }`}>
                    {member.display_name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1a1a2e]">
                      {member.wallet_address === walletAddress ? "You" : member.display_name}
                    </p>
                    <p className="text-xs text-[#6b7280]">{member.wallet_address.slice(0, 8)}...</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                  member.status === "paid"
                    ? "bg-[#ecfdf5] text-[#059669]"
                    : "bg-[#fffbeb] text-[#d97706]"
                }`}>
                  {member.status === "paid" ? "Paid" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Group */}
      {!group && !formOpen && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <p className="text-[#6b7280] mb-4">You haven&apos;t joined any savings group yet.</p>
          <button
            onClick={() => setFormOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white font-semibold rounded-xl hover:opacity-90 transition"
          >
            Create a Group
          </button>
        </div>
      )}

      {formOpen && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
          <h2 className="font-semibold text-[#1a1a2e] mb-4">Create Savings Group</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-[#6b7280] block mb-1">Group Name</label>
              <input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g. Savings Duo"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-[#6b7280] block mb-1">Weekly Amount (USDC)</label>
                <input
                  value={weeklyAmount}
                  onChange={(e) => setWeeklyAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]"
                />
              </div>
              <div>
                <label className="text-sm text-[#6b7280] block mb-1">Total Weeks</label>
                <input
                  value={totalWeeks}
                  onChange={(e) => setTotalWeeks(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={createGroup}
                disabled={creating || !groupName}
                className="px-6 py-3 bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Group"}
              </button>
              <button onClick={() => setFormOpen(false)} className="px-6 py-3 text-[#6b7280] hover:bg-gray-50 rounded-xl transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deposit */}
      {group && (
        <div>
          <button
            onClick={handleDeposit}
            disabled={depositing}
            className="w-full py-4 bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white font-bold rounded-xl hover:opacity-90 transition text-lg disabled:opacity-50"
          >
            {depositing ? "Signing transaction..." : `Deposit ${formatUsdc(group.weekly_amount)} USDC`}
          </button>
          {depositStatus && (
            <p className={`mt-3 text-sm text-center ${depositStatus.startsWith("Error") ? "text-red-500" : "text-green-600"}`}>
              {depositStatus}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
