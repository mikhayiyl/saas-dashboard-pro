import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Package,
  Search,
  Settings,
  ShoppingCart,
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
};

function Navbar({ onMenuClick, profile }: NavbarProps) {
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
    <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-white/10 bg-[#08090A]/80 px-3 backdrop-blur sm:px-6">
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
        <Search className="pointer-events-none absolute left-0 size-4 text-white/40" />
        <input
          ref={searchInputRef}
          type="search"
          value={search}
          onFocus={() => {
            setIsAccountOpen(false);
            setIsNotificationOpen(false);
          }}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search customers, products, orders..."
          aria-label="Search customers, products, and orders"
          aria-expanded={search.trim().length >= 2}
          aria-controls="navbar-search-results"
          className="w-full min-w-0 bg-transparent py-2 pl-6 pr-2 text-sm text-white outline-none placeholder:text-white/30 sm:max-w-lg"
        />
        {search.trim().length >= 2 && (
          <div
            id="navbar-search-results"
            className="absolute left-0 top-11 z-50 w-[min(32rem,calc(100vw-5rem))] overflow-hidden rounded-lg border border-white/10 bg-[#0C0D0F] shadow-2xl"
            role="listbox"
            aria-label="Search results"
          >
            {searchResultsQuery !== search.trim() ? (
              <p className="px-4 py-5 text-sm text-white/45">Searching...</p>
            ) : searchResults.length === 0 ? (
              <p className="px-4 py-5 text-sm text-white/45">
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
                    className="flex w-full items-center gap-3 border-b border-white/5 px-4 py-3 text-left last:border-0 hover:bg-white/5"
                  >
                    <Icon className="size-4 shrink-0 text-white/45" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-white">
                        {result.label}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-white/40">
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
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsNotificationOpen((previous) => !previous);
              setIsAccountOpen(false);
              setSearch("");
            }}
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
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-medium transition hover:bg-white/15"
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
            className="hidden items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium hover:bg-white/5 sm:flex"
          >
            <span className="max-w-40 truncate">{displayName}</span>
            <ChevronDown className="size-3.5 text-white/40" />
          </button>
          {isAccountOpen && (
            <div
              role="menu"
              aria-label="Account"
              className="absolute right-0 top-11 z-50 w-48 overflow-hidden rounded-lg border border-white/10 bg-[#0C0D0F] py-1 shadow-2xl"
            >
              <Link
                to="/settings"
                role="menuitem"
                onClick={() => setIsAccountOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-white/75 hover:bg-white/5 hover:text-white"
              >
                <Settings className="size-4" />
                Settings
              </Link>
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-red-400 hover:bg-red-400/10"
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
