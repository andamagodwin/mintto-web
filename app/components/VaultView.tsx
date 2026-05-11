"use client";

import { useStore } from "../lib/store";
import { Bank } from "iconsax-react";

export default function VaultView({ walletAddress }: { walletAddress: string }) {
  const { groups, solBalance, loading } = useStore();

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
      <h1 className="text-xl sm:text-2xl font-bold text-[#1a1a2e] mb-1">Vault</h1>
      <p className="text-sm text-[#6b7280] mb-6 sm:mb-8">Your on-chain savings details</p>

      {/* Wallet Balance */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 mb-6">
        <h2 className="text-sm font-medium text-[#6b7280] mb-2">Wallet Balance</h2>
        <div className="flex items-baseline gap-2 sm:gap-4 flex-wrap">
          <p className="text-xl sm:text-2xl font-bold text-[#1a1a2e]">
            {solBalance !== null ? solBalance.toFixed(4) : "—"} SOL
          </p>
          <span className="text-xs sm:text-sm text-[#6b7280]">(Devnet)</span>
        </div>
        <p className="text-[10px] sm:text-xs text-[#9ca3af] mt-2 font-mono break-all">{walletAddress}</p>
      </div>

      {/* Groups */}
      <h2 className="text-base sm:text-lg font-semibold text-[#1a1a2e] mb-4">Your Groups</h2>
      {groups.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 text-center">
          <Bank size={32} color="#6b7280" variant="Linear" className="mx-auto mb-3" />
          <p className="text-sm text-[#6b7280]">No vault groups yet. Create one from the Dashboard.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((g) => (
            <div key={g.id} className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
              <div className="flex justify-between items-start mb-4 gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-[#1a1a2e] text-base sm:text-lg truncate">{g.name}</h3>
                  <p className="text-xs sm:text-sm text-[#6b7280]">
                    Created {new Date(g.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-[10px] sm:text-xs font-medium px-2 sm:px-3 py-1 rounded-full whitespace-nowrap ${
                  g.status === "active" ? "bg-[#ecfdf5] text-[#059669]" : "bg-gray-100 text-[#6b7280]"
                }`}>
                  {g.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
                <div>
                  <p className="text-[10px] sm:text-xs text-[#6b7280]">Deposited</p>
                  <p className="text-sm sm:text-base font-semibold text-[#1a1a2e]">{formatUsdc(g.total_deposited)}</p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-[#6b7280]">Weekly</p>
                  <p className="text-sm sm:text-base font-semibold text-[#1a1a2e]">{formatUsdc(g.weekly_amount)}</p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-[#6b7280]">Duration</p>
                  <p className="text-sm sm:text-base font-semibold text-[#1a1a2e]">{g.total_weeks} wks</p>
                </div>
              </div>

              {g.vault_pda && (
                <div className="bg-[#f9fafb] rounded-xl p-3">
                  <p className="text-[10px] sm:text-xs text-[#6b7280] mb-1">Vault PDA</p>
                  <a
                    href={`https://solscan.io/account/${g.vault_pda}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] sm:text-xs font-mono text-[#F97316] hover:underline break-all"
                  >
                    {g.vault_pda}
                  </a>
                </div>
              )}

              {g.token_mint && (
                <div className="bg-[#f9fafb] rounded-xl p-3 mt-2">
                  <p className="text-[10px] sm:text-xs text-[#6b7280] mb-1">Token Mint (USDC)</p>
                  <a
                    href={`https://solscan.io/token/${g.token_mint}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] sm:text-xs font-mono text-[#F97316] hover:underline break-all"
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
