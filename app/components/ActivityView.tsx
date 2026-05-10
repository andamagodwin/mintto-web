"use client";

import { useEffect, useState } from "react";

const API_BASE = "https://mintto-api-c493341a60c4.herokuapp.com";

interface Transaction {
  id: string;
  wallet_address: string;
  tx_signature: string;
  amount: string;
  tx_type: string;
  week_number: number;
  created_at: string;
}

export default function ActivityView({ walletAddress }: { walletAddress: string }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/transactions/user/${walletAddress}`);
        if (res.ok) {
          setTransactions(await res.json());
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    load();
  }, [walletAddress]);

  function formatUsdc(lamports: number | string) {
    return (Number(lamports) / 1_000_000).toLocaleString(undefined, { minimumFractionDigits: 2 });
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
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
      <h1 className="text-2xl font-bold text-[#1a1a2e] mb-1">Activity</h1>
      <p className="text-[#6b7280] mb-8">Transaction history for your savings groups</p>

      {transactions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <p className="text-4xl mb-4">📋</p>
          <p className="text-[#6b7280]">No transactions yet. Make your first deposit to see activity here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
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
                      className="text-sm text-[#2563eb] hover:underline font-mono"
                    >
                      {tx.tx_signature.slice(0, 8)}...
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
