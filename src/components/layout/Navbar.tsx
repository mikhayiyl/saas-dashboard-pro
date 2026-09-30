import { Bell, Menu, Search } from "lucide-react";
import { useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import {
  markAllNotificationsAsRead,
  markNotificationAsRead,
  subscribeToNotifications,
} from "@/services/notificationService";
import type { Notification, UserProfile } from "@/types/database";

type NavbarProps = {
  onMenuClick: () => void;
  profile: UserProfile | null;
};

function Navbar({ onMenuClick, profile }: NavbarProps) {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  useEffect(() => {
    if (!profile) return;

    return subscribeToNotifications(profile.workspaceId, (data) => {
      setNotifications(data.slice(0, 10));
    });
  }, [profile]);

  const displayName = profile?.name ?? user?.displayName ?? "User";

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-white/10 bg-[#08090A]/80 px-3 backdrop-blur sm:px-6">
      <button
        onClick={onMenuClick}
        className="shrink-0 rounded-lg p-2 text-white/60 transition hover:bg-white/5 hover:text-white md:hidden"
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </button>
      {/* Search */}
      <div className="flex min-w-0 flex-1 items-center gap-2 text-white/40">
        <Search className="size-4" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-white/30 sm:w-64"
        />
      </div>

      {/* Right side */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsNotificationOpen((previous) => !previous)}
            className="relative flex size-9 items-center justify-center rounded-lg text-white/60 transition hover:bg-white/5 hover:text-white"
          >
            <Bell className="size-4" />

            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-semibold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          {isNotificationOpen && (
            <div className="absolute right-0 top-11 z-50 w-[min(20rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-white/10 bg-[#0C0D0F] shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Notifications
                  </h3>

                  <p className="mt-0.5 text-xs text-white/40">
                    {unreadCount} unread
                  </p>
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (!profile) return;

                      await markAllNotificationsAsRead(
                        profile.workspaceId,
                        notifications,
                      );
                    }}
                    className="text-xs text-violet-400 transition hover:text-violet-300"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-white/30">
                    No notifications
                  </p>
                ) : (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={async () => {
                        if (!profile || notification.read) return;

                        await markNotificationAsRead(
                          profile.workspaceId,
                          notification.id,
                        );
                      }}
                      className={`w-full border-b border-white/5 px-4 py-3 text-left transition hover:bg-white/5 ${
                        !notification.read ? "bg-white/2" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-1.5 size-2 shrink-0 rounded-full ${
                            notification.type === "success"
                              ? "bg-emerald-400"
                              : notification.type === "warning"
                                ? "bg-amber-400"
                                : notification.type === "error"
                                  ? "bg-red-400"
                                  : "bg-blue-400"
                          }`}
                        />

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-white">
                            {notification.title}
                          </p>

                          <p className="mt-1 text-xs leading-5 text-white/40">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-white/10 text-xs font-medium">
            {displayName.trim().charAt(0).toUpperCase() || "U"}
          </div>

          <span className="hidden max-w-40 truncate text-sm font-medium sm:block">
            {displayName}
          </span>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
