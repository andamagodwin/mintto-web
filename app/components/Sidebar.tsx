"use client";

import { Home2, Bank, Activity, Profile, Logout, Wallet } from "iconsax-react";

export default function Sidebar({
  activeTab,
  onTabChange,
  walletAddress,
  onDisconnect,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
  walletAddress: string;
  onDisconnect: () => void;
}) {
  const short = walletAddress.slice(0, 4) + "..." + walletAddress.slice(-4);

  const tabs = [
    { id: "home", label: "Dashboard", icon: Home2 },
    { id: "vault", label: "Vault", icon: Bank },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "profile", label: "Profile", icon: Profile },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col min-h-screen p-6">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] rounded-xl flex items-center justify-center">
          <span className="text-white font-bold text-lg">M</span>
        </div>
        <span className="text-xl font-bold text-[#1a1a2e]">Mintto</span>
      </div>

      <nav className="flex-1 space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${
                activeTab === tab.id
                  ? "bg-[#7c3aed]/10 text-[#7c3aed] font-semibold"
                  : "text-[#6b7280] hover:bg-gray-50"
              }`}
            >
              <Icon
                size={20}
                variant={activeTab === tab.id ? "Bold" : "Linear"}
                color={activeTab === tab.id ? "#7c3aed" : "#6b7280"}
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-gray-100 pt-4 mt-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#60a5fa] to-[#818cf8] flex items-center justify-center">
            <Wallet size={14} color="#fff" variant="Bold" />
          </div>
          <span className="text-sm text-[#1a1a2e] font-medium">{short}</span>
        </div>
        <button
          onClick={onDisconnect}
          className="flex items-center gap-2 text-xs text-[#ef4444] hover:underline"
        >
          <Logout size={14} color="#ef4444" />
          Disconnect Wallet
        </button>
      </div>
    </aside>
  );
}
