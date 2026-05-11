"use client";

import { useState } from "react";
import { depositUsdc } from "../lib/deposit";
import { useStore } from "../lib/store";
import { People, Copy, TickCircle, Edit2, CloseCircle } from "iconsax-react";

const API_BASE = "https://mintto-api-c493341a60c4.herokuapp.com";

const CURRENCIES = [
  { id: "usdc", label: "USDC", mint: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU" },
  { id: "usdt", label: "USDT", mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB" },
  { id: "sol", label: "SOL", mint: "native" },
];

export default function HomeView({ walletAddress }: { walletAddress: string }) {
  const { groupStatus: group, loading, refreshGroup, addNotification } = useStore();
  const [creating, setCreating] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [weeklyAmount, setWeeklyAmount] = useState("2");
  const [totalWeeks, setTotalWeeks] = useState("12");
  const [currency, setCurrency] = useState("usdc");
  const [depositing, setDepositing] = useState(false);
  const [depositStatus, setDepositStatus] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editWeekly, setEditWeekly] = useState("");
  const [editWeeks, setEditWeeks] = useState("");
  const [saving, setSaving] = useState(false);

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
          currency,
        }),
      });
      setFormOpen(false);
      setGroupName("");
      addNotification({ type: "success", title: "Group Created", message: `"${groupName}" is ready. Invite friends to start saving!` });
      await refreshGroup(walletAddress);
    } catch (e) {
      console.error(e);
    }
    setCreating(false);
  }

  async function handleEditGroup() {
    if (!group) return;
    setSaving(true);
    try {
      await fetch(`${API_BASE}/api/groups/${group.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName || undefined,
          weeklyAmount: editWeekly ? Math.round(Number(editWeekly) * 1_000_000) : undefined,
          totalWeeks: editWeeks ? Number(editWeeks) : undefined,
        }),
      });
      setEditOpen(false);
      addNotification({ type: "success", title: "Group Updated", message: "Your group settings have been saved." });
      await refreshGroup(walletAddress);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
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
      addNotification({
        type: "deposit",
        title: "Deposit Confirmed",
        message: `${formatUsdc(group.weekly_amount)} USDC deposited to ${group.name}`,
      });
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold text-[#1a1a2e] mb-1">Dashboard</h1>
      <p className="text-sm text-[#6b7280] mb-6 sm:mb-8">Overview of your savings groups</p>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-gradient-to-br from-[#FFF7ED] via-[#FFEDD5] to-[#FED7AA] rounded-2xl p-5 sm:p-6">
          <p className="text-sm font-medium text-[#1a1a2e]/70 mb-1">Total Saved</p>
          <p className="text-2xl sm:text-3xl font-bold text-[#1a1a2e]">
            {group ? formatUsdc(group.total_deposited) : "0.00"} <span className="text-base sm:text-lg">USDC</span>
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
          <p className="text-sm font-medium text-[#6b7280] mb-1">Current Week</p>
          <p className="text-2xl sm:text-3xl font-bold text-[#1a1a2e]">
            {group ? group.current_week : 0} <span className="text-base sm:text-lg text-[#6b7280]">/ {group?.total_weeks || 0}</span>
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 sm:col-span-2 lg:col-span-1">
          <p className="text-sm font-medium text-[#6b7280] mb-1">Group Goal</p>
          <p className="text-2xl sm:text-3xl font-bold text-[#1a1a2e]">
            {group ? formatUsdc(group.goal) : "0.00"} <span className="text-base sm:text-lg">USDC</span>
          </p>
        </div>
      </div>

      {/* Progress + Members */}
      {group && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-[#1a1a2e] text-sm sm:text-base">{group.name}</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-[#6b7280]">{group.progress}%</span>
              <button
                onClick={() => {
                  setEditName(group.name);
                  setEditWeekly(String(Number(group.weekly_amount) / 1_000_000));
                  setEditWeeks(String(group.total_weeks));
                  setEditOpen(true);
                }}
                className="p-1.5 rounded-lg hover:bg-gray-50 text-[#6b7280] hover:text-[#F97316] transition"
                title="Edit group"
              >
                <Edit2 size={16} />
              </button>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 sm:h-3 mb-4">
            <div
              className="bg-gradient-to-r from-[#F97316] to-[#EA580C] h-2.5 sm:h-3 rounded-full transition-all"
              style={{ width: `${group.progress}%` }}
            />
          </div>

          {/* Invite */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4 p-3 bg-[#FFF7ED] rounded-xl">
            <div className="flex items-center gap-2">
              <People size={18} color="#F97316" variant="Bold" />
              <span className="text-xs sm:text-sm font-medium text-[#EA580C]">Invite a friend to this group</span>
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
          <h3 className="text-xs sm:text-sm font-semibold text-[#1a1a2e] mb-3">Members ({group.members.length})</h3>
          <div className="space-y-2 sm:space-y-3">
            {group.members.map((member, i) => (
              <div key={i} className="flex items-center justify-between py-2 px-3 sm:px-4 bg-[#f9fafb] rounded-xl">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm shrink-0 ${
                    i === 0 ? "bg-gradient-to-br from-[#F97316] to-[#EA580C]" : "bg-gradient-to-br from-[#F59E0B] to-[#D97706]"
                  }`}>
                    {member.display_name[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-[#1a1a2e] truncate">
                      {member.wallet_address === walletAddress ? "You" : member.display_name}
                    </p>
                    <p className="text-[10px] sm:text-xs text-[#6b7280]">{member.wallet_address.slice(0, 6)}...{member.wallet_address.slice(-4)}</p>
                  </div>
                </div>
                <span className={`text-[10px] sm:text-xs font-medium px-2 sm:px-3 py-1 rounded-full whitespace-nowrap ${
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

      {/* Edit Group Modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEditOpen(false)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#1a1a2e]">Edit Group</h2>
              <button onClick={() => setEditOpen(false)} className="text-[#6b7280]">
                <CloseCircle size={22} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#6b7280] block mb-1">Group Name</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-[#6b7280] block mb-1">Weekly (USDC)</label>
                  <input
                    value={editWeekly}
                    onChange={(e) => setEditWeekly(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]"
                  />
                </div>
                <div>
                  <label className="text-sm text-[#6b7280] block mb-1">Total Weeks</label>
                  <input
                    value={editWeeks}
                    onChange={(e) => setEditWeeks(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]"
                  />
                </div>
              </div>
              <button
                onClick={handleEditGroup}
                disabled={saving}
                className="w-full py-3 bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Group */}
      {!group && !formOpen && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 text-center">
          <p className="text-[#6b7280] mb-4 text-sm sm:text-base">You haven&apos;t joined any savings group yet.</p>
          <button
            onClick={() => setFormOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white font-semibold rounded-xl hover:opacity-90 transition"
          >
            Create a Group
          </button>
        </div>
      )}

      {formOpen && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 mb-6 sm:mb-8">
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
            <div>
              <label className="text-sm text-[#6b7280] block mb-1">Currency</label>
              <div className="flex gap-2">
                {CURRENCIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCurrency(c.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${
                      currency === c.id
                        ? "border-[#F97316] bg-[#FFF7ED] text-[#F97316]"
                        : "border-gray-200 text-[#6b7280] hover:bg-gray-50"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-[#6b7280] block mb-1">Weekly Amount</label>
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
            {/* Preview */}
            <div className="bg-[#f9fafb] rounded-xl p-3 text-sm text-[#6b7280]">
              Total goal: <span className="font-semibold text-[#1a1a2e]">{(Number(weeklyAmount || 0) * Number(totalWeeks || 0)).toFixed(2)} {CURRENCIES.find((c) => c.id === currency)?.label}</span> over {totalWeeks || 0} weeks
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
            className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white font-bold rounded-xl hover:opacity-90 transition text-base sm:text-lg disabled:opacity-50"
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
