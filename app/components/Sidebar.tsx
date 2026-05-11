"use client";

import Image from "next/image";
import { Home2, Bank, Activity, Profile, Logout, Wallet, SidebarLeft, SidebarRight, Notification, CloseCircle } from "iconsax-react";
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
  const { sidebarCollapsed, toggleSidebar, mobileMenuOpen, setMobileMenu, notifications, markAllRead } = useStore();
  const short = walletAddress.slice(0, 4) + "..." + walletAddress.slice(-4);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const tabs = [
    { id: "home", label: "Dashboard", icon: Home2 },
    { id: "vault", label: "Vault", icon: Bank },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "notifications", label: "Notifications", icon: Notification },
    { id: "profile", label: "Profile", icon: Profile },
  ];

  function handleTabClick(tab: string) {
    onTabChange(tab);
    if (tab === "notifications") markAllRead();
    setMobileMenu(false);
  }

  const sidebarContent = (
    <>
      {/* Logo + collapse */}
      <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "justify-between"} mb-8`}>
        <div className="flex items-center gap-2">
          <Image src="/mintto-logo.png" alt="Mintto" width={36} height={36} className="rounded-xl" />
          {!sidebarCollapsed && <span className="text-lg font-bold text-[#1a1a2e]">Mintto</span>}
        </div>
        <button onClick={toggleSidebar} className="hidden md:block text-[#6b7280] hover:text-[#F97316] transition p-1 rounded-lg hover:bg-gray-50">
          {sidebarCollapsed ? <SidebarRight size={20} /> : <SidebarLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 space-y-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              title={sidebarCollapsed ? tab.label : undefined}
              className={`w-full flex items-center ${sidebarCollapsed ? "justify-center" : ""} gap-3 px-3 py-3 rounded-xl text-left transition relative ${
                isActive
                  ? "bg-[#F97316]/10 text-[#F97316] font-semibold"
                  : "text-[#6b7280] hover:bg-gray-50"
              }`}
            >
              <Icon size={20} variant={isActive ? "Bold" : "Linear"} color={isActive ? "#F97316" : "#6b7280"} />
              {!sidebarCollapsed && <span>{tab.label}</span>}
              {tab.id === "notifications" && unreadCount > 0 && (
                <span className={`absolute ${sidebarCollapsed ? "top-1 right-1" : "top-2 right-3"} w-5 h-5 bg-[#ef4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center`}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-gray-100 pt-4 mt-4">
        <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} mb-3`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F97316] to-[#EA580C] flex items-center justify-center shrink-0">
            <Wallet size={14} color="#fff" variant="Bold" />
          </div>
          {!sidebarCollapsed && <span className="text-sm text-[#1a1a2e] font-medium truncate">{short}</span>}
        </div>
        <button
          onClick={onDisconnect}
          title="Disconnect"
          className={`flex items-center ${sidebarCollapsed ? "justify-center w-full" : "gap-2"} text-xs text-[#ef4444] hover:underline`}
        >
          <Logout size={14} color="#ef4444" />
          {!sidebarCollapsed && "Disconnect"}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={`hidden md:flex ${sidebarCollapsed ? "w-20" : "w-64"} bg-white border-r border-gray-100 flex-col min-h-screen p-4 transition-all duration-300`}>
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileMenu(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white p-4 flex flex-col shadow-xl animate-slide-in">
            <button onClick={() => setMobileMenu(false)} className="absolute top-4 right-4 text-[#6b7280]">
              <CloseCircle size={24} />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
