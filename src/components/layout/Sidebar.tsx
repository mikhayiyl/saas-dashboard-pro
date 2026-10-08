import {
  BarChart3,
  Boxes,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  Sparkles,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { logoutUser } from "../../services/authService";
import { useAuth } from "@/hooks/useAuth";
import type { UserProfile } from "@/types/database";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
  profile: UserProfile | null;
};

const mainNavigation = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    name: "Products",
    icon: Package,
    path: "/products",
  },
  {
    name: "Orders",
    icon: ShoppingCart,
    path: "/orders",
  },
  {
    name: "Customers",
    icon: Users,
    path: "/customers",
  },
];

const analyticsNavigation = [
  {
    name: "Reports",
    icon: BarChart3,
    path: "/reports",
  },
  {
    name: "AI Insights",
    icon: Sparkles,
    path: "/ai-insights",
  },
];

function Sidebar({ open, onClose, profile }: SidebarProps) {
  const { user } = useAuth();
  const displayName = profile?.name ?? user?.displayName ?? "User";
  const roleName = profile?.role
    ? profile.role === "admin"
      ? "Administrator"
      : "Staff"
    : "Account";

  async function handleLogout() {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={[
          "workspace-sidebar fixed inset-y-0 left-0 z-50 w-[260px] border-r border-[#263550] bg-[#101d35] transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0",
        ].join(" ")}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-[82px] items-center border-b border-[#263550] px-5">
            <NavLink
              to="/dashboard"
              onClick={onClose}
              aria-label="SimplizerPro dashboard"
              className="flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5476e8]/50"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#345bd7] to-[#6878e8] text-white shadow-[0_5px_12px_-5px_rgba(52,91,215,0.7)]">
                <Boxes className="size-[21px]" strokeWidth={2.1} />
              </span>
              <span>
                <span className="block text-[15px] font-semibold tracking-[-0.03em] text-[#f3f6ff]">
                  Simplizer<span className="text-[#345bd7]">Pro</span>
                </span>
                <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[0.15em] text-[#8797b5]">
                  Business workspace
                </span>
              </span>
            </NavLink>
          </div>

          <nav className="flex-1 space-y-8 px-3.5 py-7">
            <NavigationSection
              title="Main"
              items={mainNavigation}
              onNavigate={onClose}
            />

            <NavigationSection
              title="Analytics"
              items={analyticsNavigation}
              onNavigate={onClose}
            />

            <NavigationSection
              title="System"
              items={[
                {
                  name: "Settings",
                  icon: Settings,
                  path: "/settings",
                },
              ]}
              onNavigate={onClose}
            />
          </nav>

          <div className="border-t border-[#263550] p-3.5">
            <div className="flex items-center gap-3 rounded-2xl bg-[#172642] p-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#283b67] text-sm font-semibold text-[#bfd0ff]">
                {displayName.trim().charAt(0).toUpperCase() || "U"}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-semibold text-[#edf2fc]">
                  {displayName}
                </p>
                <p className="mt-0.5 truncate text-[10px] text-[#93a2be]">
                  {roleName}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12px] font-medium text-[#93a2be] transition hover:bg-rose-400/10 hover:text-rose-300"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

type NavigationItem = {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
};

type NavigationSectionProps = {
  title: string;
  items: NavigationItem[];
  onNavigate: () => void;
};

function NavigationSection({
  title,
  items,
  onNavigate,
}: NavigationSectionProps) {
  return (
    <div>
      <p className="mb-2.5 px-3 text-[9px] font-semibold uppercase tracking-[0.17em] text-[#71819e]">
        {title}
      </p>

      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onNavigate}
              className={({ isActive }) =>
                [
                  "group relative flex items-center gap-3 rounded-xl px-3 py-[11px] text-[12px] font-medium transition-colors",
                  isActive
                    ? "bg-[#263b68] text-[#c5d3ff] shadow-[inset_0_0_0_1px_rgba(132,159,255,0.12)]"
                    : "text-[#a0aec8] hover:bg-white/[0.045] hover:text-white",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`size-[17px] ${
                      isActive
                        ? "text-[#a9bdff]"
                        : "text-[#7889a8] transition-colors group-hover:text-[#a9bdff]"
                    }`}
                  />
                  <span className="flex-1">{item.name}</span>
                  {isActive && (
                    <span className="absolute bottom-2.5 left-0 top-2.5 w-[3px] rounded-full bg-[#91aaff]" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}

export default Sidebar;
