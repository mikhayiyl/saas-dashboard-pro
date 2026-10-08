import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Package,
  Search,
  Settings,
  ShoppingCart,
  Sun,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import { logoutUser } from "@/services/authService";
import {
  searchWorkspaceRecords,
  type WorkspaceSearchResult,
} from "@/services/searchService";
import {
  markAllNotificationsAsRead,
  markNotificationAsRead,
  subscribeToNotifications,
} from "@/services/notificationService";
import type { Notification, UserProfile } from "@/types/database";

type NavbarProps = {
  onMenuClick: () => void;
  profile: UserProfile | null;
  theme: "dark" | "light";
  onToggleTheme: () => void;
};

function Navbar({ onMenuClick, profile, theme, onToggleTheme }: NavbarProps) {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<WorkspaceSearchResult[]>(
    [],
  );
  const [searchResultsQuery, setSearchResultsQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const accountContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!profile) return;

    return subscribeToNotifications(profile.workspaceId, (data) => {
      setNotifications(data.slice(0, 10));
    });
  }, [profile]);

  useEffect(() => {
    const query = search.trim();

    if (!profile?.workspaceId || query.length < 2) return;

    let isCurrent = true;

    const timeoutId = window.setTimeout(() => {
      searchWorkspaceRecords(profile.workspaceId, query)
        .then((results) => {
          if (isCurrent) {
            setSearchResults(results);
            setSearchResultsQuery(query);
          }
        })
        .catch((error) => {
          console.error("Failed to search workspace records:", error);
          if (isCurrent) {
            setSearchResults([]);
            setSearchResultsQuery(query);
          }
        });
    }, 250);

    return () => {
      isCurrent = false;
      window.clearTimeout(timeoutId);
    };
  }, [profile?.workspaceId, search]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }

      if (event.key === "Escape") {
        setIsAccountOpen(false);
        searchInputRef.current?.blur();
      }
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (!searchContainerRef.current?.contains(target)) {
        setSearch("");
      }

      if (!accountContainerRef.current?.contains(target)) {
        setIsAccountOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  const displayName = profile?.name ?? user?.displayName ?? "User";

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  async function handleLogout() {
    try {
      await logoutUser();
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Unable to sign out");
    }
  }

  function openSearchResult(result: WorkspaceSearchResult) {
    navigate(`${result.path}?search=${encodeURIComponent(search.trim())}`);
    setSearch("");
    searchInputRef.current?.blur();
  }

  return (
    <header className="workspace-navbar sticky top-0 z-10 flex h-[76px] items-center gap-3 border-b border-[#263550] bg-[#101a2e]/90 px-3 backdrop-blur-xl sm:px-6 xl:px-9">
      <button
        onClick={onMenuClick}
        className="shrink-0 rounded-lg p-2 text-white/60 transition hover:bg-white/5 hover:text-white md:hidden"
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </button>
      {/* Search */}
      <div
        ref={searchContainerRef}
        className="relative flex min-w-0 flex-1 items-center"
      >
        <Search className="pointer-events-none absolute left-3.5 size-4 text-[#8190ad]" />
        <input
          ref={searchInputRef}
          type="search"
          value={search}
          onFocus={() => {
            setIsAccountOpen(false);
            setIsNotificationOpen(false);
          }}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search anything..."
          aria-label="Search customers, products, and orders"
          aria-expanded={search.trim().length >= 2}
          aria-controls="navbar-search-results"
          className="w-full min-w-0 rounded-xl border border-[#2a3955] bg-[#0c172b] py-2.5 pl-10 pr-14 text-[13px] text-[#edf2fc] outline-none transition placeholder:text-[#71819e] hover:border-[#465b83] focus:border-[#718ef0]/70 focus:bg-[#111e35] focus:ring-4 focus:ring-[#5476e8]/[0.12] sm:max-w-md"
        />
        {search.trim().length >= 2 && (
          <div
            id="navbar-search-results"
            className="absolute left-0 top-12 z-50 w-[min(32rem,calc(100vw-5rem))] overflow-hidden rounded-xl border border-[#2c3b59] bg-[#121f38] shadow-xl shadow-black/30"
            role="listbox"
            aria-label="Search results"
          >
            {searchResultsQuery !== search.trim() ? (
              <p className="px-4 py-5 text-sm text-[#99a8c4]">Searching...</p>
            ) : searchResults.length === 0 ? (
              <p className="px-4 py-5 text-sm text-[#99a8c4]">
                No matching customers, products, or orders.
              </p>
            ) : (
              searchResults.map((result) => {
                const Icon =
                  result.type === "Customer"
                    ? Users
                    : result.type === "Product"
                      ? Package
                      : ShoppingCart;

                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    type="button"
                    role="option"
                    aria-selected="false"
                    onClick={() => openSearchResult(result)}
                    className="flex w-full items-center gap-3 border-b border-white/[0.06] px-4 py-3 text-left last:border-0 hover:bg-white/[0.04]"
                  >
                    <Icon className="size-4 shrink-0 text-[#8294b3]" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-[#edf2fc]">
                        {result.label}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-[#91a1bf]">
                        {result.type} · {result.detail}
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Right side */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          className="flex size-10 items-center justify-center rounded-xl border border-transparent text-[#9aa9c3] transition hover:border-white/[0.08] hover:bg-white/[0.045] hover:text-white"
        >
          {theme === "dark" ? (
            <Sun aria-hidden="true" className="size-[17px]" />
          ) : (
            <Moon aria-hidden="true" className="size-[17px]" />
          )}
        </button>
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsNotificationOpen((previous) => !previous);
              setIsAccountOpen(false);
              setSearch("");
            }}
            aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
            className="relative flex size-10 items-center justify-center rounded-xl border border-transparent text-[#9aa9c3] transition hover:border-white/[0.08] hover:bg-white/[0.045] hover:text-white"
          >
            <Bell className="size-4" />

            {unreadCount > 0 && (
              <span className="notification-badge absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-[#0d1628]">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          {isNotificationOpen && (
            <div className="absolute right-0 top-11 z-50 w-[min(20rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-[#2c3b59] bg-[#121f38] shadow-xl shadow-black/30">
              <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
                <div>
                  <h3 className="text-sm font-semibold text-[#edf2fc]">
                    Notifications
                  </h3>

                  <p className="mt-0.5 text-xs text-[#91a1bf]">
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
                    className="text-xs font-medium text-[#a9bdff] transition hover:text-white"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-[#91a1bf]">
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
                      className={`w-full border-b border-white/[0.06] px-4 py-3 text-left transition hover:bg-white/[0.04] ${
                        !notification.read ? "bg-white/[0.025]" : ""
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
                          <p className="text-sm font-medium text-[#edf2fc]">
                            {notification.title}
                          </p>

                          <p className="mt-1 text-xs leading-5 text-[#99a8c4]">
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
        <div
          ref={accountContainerRef}
          className="relative flex items-center gap-2"
        >
          <button
            type="button"
            onClick={() => {
              setIsAccountOpen((open) => !open);
              setIsNotificationOpen(false);
              setSearch("");
            }}
            aria-label={`Account menu for ${displayName}`}
            aria-haspopup="menu"
            aria-expanded={isAccountOpen}
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4568df] to-[#8a72e8] text-xs font-semibold text-white ring-2 ring-[#7089eb]/20 transition hover:ring-[#7089eb]/40"
          >
            {displayName.trim().charAt(0).toUpperCase() || "U"}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAccountOpen((open) => !open);
              setIsNotificationOpen(false);
              setSearch("");
            }}
            aria-label={`Account menu for ${displayName}`}
            aria-haspopup="menu"
            aria-expanded={isAccountOpen}
            className="hidden items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] font-medium text-[#dce5f7] hover:bg-white/[0.045] sm:flex"
          >
            <span className="max-w-40 truncate">{displayName}</span>
            <ChevronDown className="size-3.5 text-white/40" />
          </button>
          {isAccountOpen && (
            <div
              role="menu"
              aria-label="Account"
              className="absolute right-0 top-11 z-50 w-48 overflow-hidden rounded-xl border border-[#2c3b59] bg-[#121f38] py-1 shadow-xl shadow-black/30"
            >
              <Link
                to="/settings"
                role="menuitem"
                onClick={() => setIsAccountOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#c1cce0] hover:bg-white/[0.045] hover:text-white"
              >
                <Settings className="size-4" />
                Settings
              </Link>
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-[#c34452] hover:bg-[#fff2f2]"
              >
                <LogOut className="size-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
