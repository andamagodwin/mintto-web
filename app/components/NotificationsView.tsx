"use client";

import { useStore, Notification } from "../lib/store";
import { Notification as NotifIcon, Trash } from "iconsax-react";

export default function NotificationsView() {
  const { notifications, clearNotification, markAllRead } = useStore();

  function timeAgo(ts: number) {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  const iconColor: Record<Notification["type"], string> = {
    success: "#059669",
    warning: "#d97706",
    info: "#2563eb",
    deposit: "#F97316",
  };

  const bgColor: Record<Notification["type"], string> = {
    success: "bg-[#ecfdf5]",
    warning: "bg-[#fffbeb]",
    info: "bg-[#eff6ff]",
    deposit: "bg-[#FFF7ED]",
  };

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1a1a2e]">Notifications</h1>
          <p className="text-sm text-[#6b7280]">Stay updated on your group activity</p>
        </div>
        {notifications.length > 0 && (
          <button onClick={markAllRead} className="text-xs text-[#F97316] hover:underline font-medium">
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-12 text-center">
          <NotifIcon size={40} color="#d1d5db" variant="Linear" className="mx-auto mb-4" />
          <p className="text-[#6b7280] mb-1">No notifications yet</p>
          <p className="text-sm text-[#9ca3af]">You&apos;ll see deposit confirmations, reminders, and group updates here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 p-4 rounded-xl border transition ${
                n.read ? "bg-white border-gray-100" : "bg-[#FFF7ED] border-[#FFEDD5]"
              }`}
            >
              <div className={`w-9 h-9 rounded-full ${bgColor[n.type]} flex items-center justify-center shrink-0 mt-0.5`}>
                <NotifIcon size={16} color={iconColor[n.type]} variant="Bold" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1a1a2e]">{n.title}</p>
                <p className="text-sm text-[#6b7280] mt-0.5">{n.message}</p>
                <p className="text-xs text-[#9ca3af] mt-1">{timeAgo(n.time)}</p>
              </div>
              <button
                onClick={() => clearNotification(n.id)}
                className="text-[#9ca3af] hover:text-[#ef4444] transition shrink-0"
              >
                <Trash size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
