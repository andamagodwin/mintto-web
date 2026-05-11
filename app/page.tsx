"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { HambergerMenu } from "iconsax-react";
import Sidebar from "./components/Sidebar";
import HomeView from "./components/HomeView";
import VaultView from "./components/VaultView";
import ActivityView from "./components/ActivityView";
import ProfileView from "./components/ProfileView";
import NotificationsView from "./components/NotificationsView";
import { useStore } from "./lib/store";

const API_BASE = "https://mintto-api-c493341a60c4.herokuapp.com";

export default function Home() {
  const { walletAddress, setWallet, fetchAll, setMobileMenu, notifications } = useStore();
  const [activeTab, setActiveTab] = useState("home");
  const [connecting, setConnecting] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

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

        setWallet(address);
        fetchAll(address);
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
    setWallet(null);
    setActiveTab("home");
  }

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).solana?.isConnected) {
      const address = (window as any).solana.publicKey?.toString();
      if (address) {
        setWallet(address);
        fetchAll(address);
      }
    }
  }, []);

  if (!walletAddress) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF7ED] via-[#FFEDD5] to-[#FED7AA] p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 max-w-md w-full text-center">
          <Image src="/mintto-logo.png" alt="Mintto" width={72} height={72} className="mx-auto mb-6 rounded-2xl" />
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a2e] mb-3">Mintto</h1>
          <p className="text-[#6b7280] mb-8 leading-relaxed text-sm sm:text-base">
            Group savings on Solana. Save together with friends using transparent on-chain vaults.
          </p>
          <button
            onClick={connectWallet}
            disabled={connecting}
            className="w-full py-4 px-6 bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50 text-base sm:text-lg"
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

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-40">
          <button onClick={() => setMobileMenu(true)} className="p-2 text-[#1a1a2e]">
            <HambergerMenu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <Image src="/mintto-logo.png" alt="Mintto" width={28} height={28} className="rounded-lg" />
            <span className="font-bold text-[#1a1a2e]">Mintto</span>
          </div>
          <button
            onClick={() => { setActiveTab("notifications"); }}
            className="p-2 text-[#6b7280] relative"
          >
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#ef4444] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          {activeTab === "home" && <HomeView walletAddress={walletAddress} />}
          {activeTab === "vault" && <VaultView walletAddress={walletAddress} />}
          {activeTab === "activity" && <ActivityView walletAddress={walletAddress} />}
          {activeTab === "notifications" && <NotificationsView />}
          {activeTab === "profile" && <ProfileView walletAddress={walletAddress} onDisconnect={disconnectWallet} />}
        </main>
      </div>
    </div>
  );
}
