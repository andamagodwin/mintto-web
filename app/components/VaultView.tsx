"use client";

import { useEffect, useState } from "react";

const API_BASE = "https://mintto-api-c493341a60c4.herokuapp.com";

interface GroupInfo {
  id: string;
  name: string;
  weekly_amount: string;
  total_weeks: number;
  current_week: number;
  total_deposited: string;
  status: string;
  vault_pda: string | null;
  group_pda: string | null;
  token_mint: string;
  created_at: string;
}

export default function VaultView({ walletAddress }: { walletAddress: string }) {
  const [groups, setGroups] = useState<GroupInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [solBalance, setSolBalance] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/groups/${walletAddress}`);
        setGroups(await res.json());
      } catch (e) {
        console.error(e);
      }

      try {
        const rpc = await fetch("https://api.devnet.solana.com", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "getBalance",
            params: [walletAddress],
          }),
        });
        const data = await rpc.json();
        setSolBalance(data.result?.value / 1_000_000_000);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-[#7c3aed] font-semibold animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-[#1a1a2e] mb-1">Vault</h1>
      <p className="text-[#6b7280] mb-8">Your on-chain savings details</p>

      {/* Wallet Balance */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h2 className="text-sm font-medium text-[#6b7280] mb-2">Wallet Balance</h2>
        <div className="flex items-baseline gap-4">
          <p className="text-2xl font-bold text-[#1a1a2e]">
            {solBalance !== null ? solBalance.toFixed(4) : "—"} SOL
          </p>
          <span className="text-sm text-[#6b7280]">(Devnet)</span>
        </div>
        <p className="text-xs text-[#9ca3af] mt-2 font-mono">{walletAddress}</p>
      </div>

      {/* Groups */}
      <h2 className="text-lg font-semibold text-[#1a1a2e] mb-4">Your Groups</h2>
      {groups.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <p className="text-[#6b7280]">No vault groups yet. Create one from the Dashboard.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((g) => (
            <div key={g.id} className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-[#1a1a2e] text-lg">{g.name}</h3>
                  <p className="text-sm text-[#6b7280]">
                    Created {new Date(g.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                  g.status === "active" ? "bg-[#ecfdf5] text-[#059669]" : "bg-gray-100 text-[#6b7280]"
                }`}>
                  {g.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-[#6b7280]">Deposited</p>
                  <p className="font-semibold text-[#1a1a2e]">{formatUsdc(g.total_deposited)} USDC</p>
                </div>
                <div>
                  <p className="text-xs text-[#6b7280]">Weekly</p>
                  <p className="font-semibold text-[#1a1a2e]">{formatUsdc(g.weekly_amount)} USDC</p>
                </div>
                <div>
                  <p className="text-xs text-[#6b7280]">Duration</p>
                  <p className="font-semibold text-[#1a1a2e]">{g.total_weeks} weeks</p>
                </div>
              </div>

              {g.vault_pda && (
                <div className="bg-[#f9fafb] rounded-xl p-3">
                  <p className="text-xs text-[#6b7280] mb-1">Vault PDA</p>
                  <a
                    href={`https://solscan.io/account/${g.vault_pda}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-[#2563eb] hover:underline break-all"
                  >
                    {g.vault_pda}
                  </a>
                </div>
              )}

              {g.token_mint && (
                <div className="bg-[#f9fafb] rounded-xl p-3 mt-2">
                  <p className="text-xs text-[#6b7280] mb-1">Token Mint (USDC)</p>
                  <a
                    href={`https://solscan.io/token/${g.token_mint}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-[#2563eb] hover:underline break-all"
                  >
                    {g.token_mint}
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
