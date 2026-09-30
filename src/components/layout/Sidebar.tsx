import {
  BarChart3,
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

      {/* sidebar */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-white/10 bg-[#0C0D0F] transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0",
        ].join(" ")}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-white/10 px-6">
            <NavLink
              to="/dashboard"
              onClick={onClose}
              aria-label="SimplizerPro dashboard"
              className="flex items-center gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <img
                src="/simplizerpro-logo.png"
                alt=""
                className="size-8 shrink-0 rounded-lg object-contain"
              />
              <span className="text-lg font-semibold tracking-tight">
                SimplizerPro
              </span>
            </NavLink>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-6 p-4">
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

          {/* User */}
          <div className="border-t border-white/10 p-4">
            <div className="flex items-center gap-3 rounded-lg p-2">
              <div className="flex size-9 items-center justify-center rounded-full bg-white/10 text-sm font-medium">
                {displayName.trim().charAt(0).toUpperCase() || "U"}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{displayName}</p>
                <p className="truncate text-xs text-white/40">{roleName}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/50 transition hover:bg-red-400/10 hover:text-red-400"
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
      <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-white/40">
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
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
                  isActive
                    ? "bg-white text-black"
                    : "text-white/60 hover:bg-white/5 hover:text-white",
                ].join(" ")
              }
            >
              <Icon className="size-4" />
              {item.name}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}

export default Sidebar;
