"use client";

import { useStore } from "../lib/store";
import { Wallet } from "iconsax-react";

export default function ProfileView({
  walletAddress,
  onDisconnect,
}: {
  walletAddress: string;
  onDisconnect: () => void;
}) {
  const { userSummary, solBalance, loading } = useStore();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-[#F97316] font-semibold animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-[#1a1a2e] mb-1">Profile</h1>
      <p className="text-[#6b7280] mb-8">Your wallet and account details</p>

      {/* Wallet Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#F97316] to-[#EA580C] flex items-center justify-center">
            <Wallet size={24} color="#fff" variant="Bold" />
          </div>
          <div>
            <p className="font-semibold text-[#1a1a2e]">Connected Wallet</p>
            <p className="text-sm font-mono text-[#6b7280] break-all">{walletAddress}</p>
          </div>
        </div>
        <div className="bg-[#f9fafb] rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#6b7280]">SOL Balance (Devnet)</p>
            <p className="text-lg font-bold text-[#1a1a2e]">
              {solBalance !== null ? solBalance.toFixed(4) : "—"} SOL
            </p>
          </div>
          <a
            href={`https://solscan.io/account/${walletAddress}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#F97316] hover:underline"
          >
            View on Solscan →
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h2 className="font-semibold text-[#1a1a2e] mb-4">Savings Summary</h2>
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-[#F97316]">{userSummary?.groupCount || 0}</p>
            <p className="text-sm text-[#6b7280]">Groups</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-[#F97316]">
              {userSummary ? (userSummary.totalSaved / 1_000_000).toFixed(1) : "0"}
            </p>
            <p className="text-sm text-[#6b7280]">USDC Saved</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-[#F97316]">{userSummary?.weeksPaid || 0}</p>
            <p className="text-sm text-[#6b7280]">Weeks Paid</p>
          </div>
        </div>
      </div>

      {/* Network */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h2 className="font-semibold text-[#1a1a2e] mb-4">Network</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#10b981]" />
            <span className="text-sm text-[#1a1a2e]">Solana Devnet</span>
          </div>
          <span className="text-xs text-[#6b7280] font-mono">api.devnet.solana.com</span>
        </div>
      </div>

      {/* Disconnect */}
      <button
        onClick={onDisconnect}
        className="w-full py-3 border border-[#ef4444] text-[#ef4444] font-semibold rounded-xl hover:bg-[#fef2f2] transition"
      >
        Disconnect Wallet
      </button>
    </div>
  );
}
