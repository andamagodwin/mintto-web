"use client";

import { useState } from "react";

const API_BASE = "https://mintto-api-c493341a60c4.herokuapp.com";

export default function ConnectScreen({
  onConnect,
}: {
  onConnect: (address: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleConnect() {
    setLoading(true);
    try {
      if (typeof window !== "undefined" && (window as any).solana) {
        const provider = (window as any).solana;
        const resp = await provider.connect();
        const address = resp.publicKey.toString();

        await fetch(`${API_BASE}/api/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            walletAddress: address,
            displayName: address.slice(0, 4) + "..." + address.slice(-4),
          }),
        });

        onConnect(address);
      } else {
        window.open("https://phantom.app/", "_blank");
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#93c5fd] via-[#c4b5fd] to-[#fbcfe8]">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-sm w-full text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] rounded-full mx-auto mb-6 flex items-center justify-center">
          <span className="text-white text-2xl font-bold">M</span>
        </div>
        <h1 className="text-2xl font-bold text-[#1a1a2e] mb-2">Mintto</h1>
        <p className="text-[#6b7280] text-sm mb-8">
          Group savings on Solana. Save together with friends using transparent on-chain vaults.
        </p>
        <button
          onClick={handleConnect}
          disabled={loading}
          className="w-full py-3 px-6 bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] text-white font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "Connecting..." : "Connect Wallet"}
        </button>
        <p className="text-xs text-[#9ca3af] mt-4">
          Works with Phantom, Solflare & other Solana wallets
        </p>
      </div>
    </div>
  );
}
