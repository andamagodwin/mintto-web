"use client";

import { useStore } from "../lib/store";
import { Activity } from "iconsax-react";

export default function ActivityView({ }: { walletAddress: string }) {
  const { transactions, loading } = useStore();

  function formatUsdc(lamports: number | string) {
    return (Number(lamports) / 1_000_000).toLocaleString(undefined, { minimumFractionDigits: 2 });
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
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
      <h1 className="text-xl sm:text-2xl font-bold text-[#1a1a2e] mb-1">Activity</h1>
      <p className="text-sm text-[#6b7280] mb-6 sm:mb-8">Transaction history for your savings groups</p>

      {transactions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 text-center">
          <Activity size={32} color="#6b7280" variant="Linear" className="mx-auto mb-3" />
          <p className="text-sm text-[#6b7280]">No transactions yet. Make your first deposit to see activity here.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-[#6b7280] uppercase px-6 py-4">Type</th>
                  <th className="text-left text-xs font-medium text-[#6b7280] uppercase px-6 py-4">Amount</th>
                  <th className="text-left text-xs font-medium text-[#6b7280] uppercase px-6 py-4">Week</th>
                  <th className="text-left text-xs font-medium text-[#6b7280] uppercase px-6 py-4">Time</th>
                  <th className="text-left text-xs font-medium text-[#6b7280] uppercase px-6 py-4">Transaction</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-gray-50 hover:bg-[#f9fafb] transition">
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                        tx.tx_type === "deposit"
                          ? "bg-[#ecfdf5] text-[#059669]"
                          : "bg-[#eff6ff] text-[#2563eb]"
                      }`}>
                        {tx.tx_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#1a1a2e]">
                      {formatUsdc(tx.amount)} USDC
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6b7280]">
                      Week {tx.week_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6b7280]">
                      {timeAgo(tx.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={`https://solscan.io/tx/${tx.tx_signature}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#F97316] hover:underline font-mono"
                      >
                        {tx.tx_signature.slice(0, 8)}...
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    tx.tx_type === "deposit"
                      ? "bg-[#ecfdf5] text-[#059669]"
                      : "bg-[#eff6ff] text-[#2563eb]"
                  }`}>
                    {tx.tx_type}
                  </span>
                  <span className="text-[10px] text-[#6b7280]">{timeAgo(tx.created_at)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-[#1a1a2e] text-sm">{formatUsdc(tx.amount)} USDC</p>
                  <span className="text-xs text-[#6b7280]">Week {tx.week_number}</span>
                </div>
                <a
                  href={`https://solscan.io/tx/${tx.tx_signature}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-[#F97316] hover:underline font-mono mt-1 block"
                >
                  {tx.tx_signature.slice(0, 16)}...
                </a>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
