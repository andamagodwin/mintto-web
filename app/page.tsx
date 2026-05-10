"use client";

import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import HomeView from "./components/HomeView";
import VaultView from "./components/VaultView";
import ActivityView from "./components/ActivityView";
import ProfileView from "./components/ProfileView";

const API_BASE = "https://mintto-api-c493341a60c4.herokuapp.com";

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [connecting, setConnecting] = useState(false);

  async function connectWallet() {
    setConnecting(true);
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
        }).catch(() => {});

        setWalletAddress(address);
      } else {
        window.open("https://phantom.app/", "_blank");
      }
    } catch (e) {
      console.error(e);
    }
    setConnecting(false);
  }

  function disconnectWallet() {
    if (typeof window !== "undefined" && (window as any).solana) {
      (window as any).solana.disconnect();
    }
    setWalletAddress(null);
    setActiveTab("home");
  }

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).solana?.isConnected) {
      const address = (window as any).solana.publicKey?.toString();
      if (address) setWalletAddress(address);
    }
  }, []);

  if (!walletAddress) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#93c5fd] via-[#c4b5fd] to-[#fbcfe8]">
        <div className="bg-white rounded-3xl shadow-xl p-12 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] rounded-2xl mx-auto mb-8 flex items-center justify-center">
            <span className="text-white text-3xl font-bold">M</span>
          </div>
          <h1 className="text-3xl font-bold text-[#1a1a2e] mb-3">Mintto</h1>
          <p className="text-[#6b7280] mb-8 leading-relaxed">
            Group savings on Solana. Save together with friends using transparent on-chain vaults.
          </p>
          <button
            onClick={connectWallet}
            disabled={connecting}
            className="w-full py-4 px-6 bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] text-white font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50 text-lg"
          >
            {connecting ? "Connecting..." : "Connect Wallet"}
          </button>
          <p className="text-xs text-[#9ca3af] mt-5">
            Works with Phantom, Solflare & other Solana wallets
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#f9fafb]">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        walletAddress={walletAddress}
        onDisconnect={disconnectWallet}
      />
      <main className="flex-1 overflow-y-auto">
        {activeTab === "home" && <HomeView walletAddress={walletAddress} />}
        {activeTab === "vault" && <VaultView walletAddress={walletAddress} />}
        {activeTab === "activity" && <ActivityView walletAddress={walletAddress} />}
        {activeTab === "profile" && <ProfileView walletAddress={walletAddress} onDisconnect={disconnectWallet} />}
      </main>
    </div>
  );
}
