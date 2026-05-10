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

export default function HomeView({ walletAddress }: { walletAddress: string }) {
  const [group, setGroup] = useState<GroupStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [weeklyAmount, setWeeklyAmount] = useState("2000000");
  const [totalWeeks, setTotalWeeks] = useState("12");

  async function loadData() {
    try {
      const res = await fetch(`${API_BASE}/api/groups/${walletAddress}`);
      const groups = await res.json();
      if (groups.length > 0) {
        const statusRes = await fetch(`${API_BASE}/api/groups/${groups[0].id}/status`);
        setGroup(await statusRes.json());
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  useEffect(() => { loadData(); }, [walletAddress]);

  async function createGroup() {
    setCreating(true);
    try {
      await fetch(`${API_BASE}/api/groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: groupName,
          creatorWallet: walletAddress,
          weeklyAmount: Number(weeklyAmount),
          totalWeeks: Number(totalWeeks),
        }),
      });
      setFormOpen(false);
      setGroupName("");
      await loadData();
    } catch (e) {
      console.error(e);
    }
    setCreating(false);
  }

  function formatUsdc(lamports: number | string) {
    return (Number(lamports) / 1_000_000).toLocaleString(undefined, { minimumFractionDigits: 2 });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-[#7c3aed] font-semibold animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-[#1a1a2e] mb-1">Dashboard</h1>
      <p className="text-[#6b7280] mb-8">Overview of your savings groups</p>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-[#93c5fd] via-[#c4b5fd] to-[#fbcfe8] rounded-2xl p-6">
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

      {/* Progress */}
      {group && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-[#1a1a2e]">{group.name}</h2>
            <span className="text-sm text-[#6b7280]">{group.progress}% complete</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 mb-4">
            <div
              className="bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] h-3 rounded-full transition-all"
              style={{ width: `${group.progress}%` }}
            />
          </div>

          {/* Members */}
          <h3 className="text-sm font-semibold text-[#1a1a2e] mb-3">Members</h3>
          <div className="space-y-3">
            {group.members.map((member, i) => (
              <div key={i} className="flex items-center justify-between py-2 px-4 bg-[#f9fafb] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    i === 0 ? "bg-gradient-to-br from-[#60a5fa] to-[#818cf8]" : "bg-gradient-to-br from-[#fbbf24] to-[#f97316]"
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

      {/* Create Group / Deposit */}
      {!group && !formOpen && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <p className="text-[#6b7280] mb-4">You haven&apos;t joined any savings group yet.</p>
          <button
            onClick={() => setFormOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] text-white font-semibold rounded-xl hover:opacity-90 transition"
          >
            Create a Group
          </button>
        </div>
      )}

      {formOpen && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-[#1a1a2e] mb-4">Create Savings Group</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-[#6b7280] block mb-1">Group Name</label>
              <input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g. Savings Duo"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 focus:border-[#7c3aed]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-[#6b7280] block mb-1">Weekly Amount (USDC micro)</label>
                <input
                  value={weeklyAmount}
                  onChange={(e) => setWeeklyAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 focus:border-[#7c3aed]"
                />
              </div>
              <div>
                <label className="text-sm text-[#6b7280] block mb-1">Total Weeks</label>
                <input
                  value={totalWeeks}
                  onChange={(e) => setTotalWeeks(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 focus:border-[#7c3aed]"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={createGroup}
                disabled={creating || !groupName}
                className="px-6 py-3 bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] text-white font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Group"}
              </button>
              <button
                onClick={() => setFormOpen(false)}
                className="px-6 py-3 text-[#6b7280] hover:bg-gray-50 rounded-xl transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {group && (
        <button className="w-full py-4 bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] text-white font-bold rounded-xl hover:opacity-90 transition text-lg">
          Deposit {formatUsdc(group.weekly_amount)} USDC
        </button>
      )}
    </div>
  );
}
