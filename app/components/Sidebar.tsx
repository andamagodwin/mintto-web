"use client";

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
    { id: "home", label: "Dashboard", icon: "📊" },
    { id: "vault", label: "Vault", icon: "🏦" },
    { id: "activity", label: "Activity", icon: "📋" },
    { id: "profile", label: "Profile", icon: "👤" },
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
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${
              activeTab === tab.id
                ? "bg-[#7c3aed]/10 text-[#7c3aed] font-semibold"
                : "text-[#6b7280] hover:bg-gray-50"
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      <div className="border-t border-gray-100 pt-4 mt-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#60a5fa] to-[#818cf8] flex items-center justify-center">
            <span className="text-white text-xs font-bold">{short[0]}</span>
          </div>
          <span className="text-sm text-[#1a1a2e] font-medium">{short}</span>
        </div>
        <button
          onClick={onDisconnect}
          className="text-xs text-[#ef4444] hover:underline"
        >
          Disconnect Wallet
        </button>
      </div>
    </aside>
  );
}
