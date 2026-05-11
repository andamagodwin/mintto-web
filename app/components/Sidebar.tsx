"use client";

import Image from "next/image";
import { Home2, Bank, Activity, Profile, Logout, Wallet, ArrowLeft2, ArrowRight2 } from "iconsax-react";
import { useStore } from "../lib/store";

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
  const { sidebarCollapsed, toggleSidebar } = useStore();
  const short = walletAddress.slice(0, 4) + "..." + walletAddress.slice(-4);

  const tabs = [
    { id: "home", label: "Dashboard", icon: Home2 },
    { id: "vault", label: "Vault", icon: Bank },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "profile", label: "Profile", icon: Profile },
  ];

  return (
    <aside className={`${sidebarCollapsed ? "w-20" : "w-64"} bg-white border-r border-gray-100 flex flex-col min-h-screen p-4 transition-all duration-300`}>
      {/* Logo + collapse */}
      <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "justify-between"} mb-8`}>
        <div className="flex items-center gap-2">
          <Image src="/mintto-logo.png" alt="Mintto" width={36} height={36} className="rounded-xl" />
          {!sidebarCollapsed && <span className="text-lg font-bold text-[#1a1a2e]">Mintto</span>}
        </div>
        <button onClick={toggleSidebar} className={`text-[#6b7280] hover:text-[#F97316] transition ${sidebarCollapsed ? "hidden" : ""}`}>
          <ArrowLeft2 size={18} />
        </button>
      </div>

      {sidebarCollapsed && (
        <button onClick={toggleSidebar} className="mx-auto mb-4 text-[#6b7280] hover:text-[#F97316] transition">
          <ArrowRight2 size={18} />
        </button>
      )}

      <nav className="flex-1 space-y-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              title={sidebarCollapsed ? tab.label : undefined}
              className={`w-full flex items-center ${sidebarCollapsed ? "justify-center" : ""} gap-3 px-3 py-3 rounded-xl text-left transition ${
                isActive
                  ? "bg-[#F97316]/10 text-[#F97316] font-semibold"
                  : "text-[#6b7280] hover:bg-gray-50"
              }`}
            >
              <Icon size={20} variant={isActive ? "Bold" : "Linear"} color={isActive ? "#F97316" : "#6b7280"} />
              {!sidebarCollapsed && <span>{tab.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-gray-100 pt-4 mt-4">
        <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} mb-3`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F97316] to-[#EA580C] flex items-center justify-center">
            <Wallet size={14} color="#fff" variant="Bold" />
          </div>
          {!sidebarCollapsed && <span className="text-sm text-[#1a1a2e] font-medium">{short}</span>}
        </div>
        <button
          onClick={onDisconnect}
          title="Disconnect"
          className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-2"} text-xs text-[#ef4444] hover:underline`}
        >
          <Logout size={14} color="#ef4444" />
          {!sidebarCollapsed && "Disconnect"}
        </button>
      </div>
    </aside>
  );
}
