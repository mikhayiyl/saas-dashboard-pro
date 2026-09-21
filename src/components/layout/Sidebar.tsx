import {
  BarChart3,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Sparkles,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
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

function Sidebar({ open, onClose }: SidebarProps) {
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
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-white text-sm font-bold text-black">
                N
              </div>

              <span className="text-lg font-semibold tracking-tight">NOVA</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-6 p-4">
            <NavigationSection title="Main" items={mainNavigation} />

            <NavigationSection title="Analytics" items={analyticsNavigation} />

            <NavigationSection
              title="System"
              items={[
                {
                  name: "Settings",
                  icon: Settings,
                  path: "/settings",
                },
              ]}
            />
          </nav>

          {/* User */}
          <div className="border-t border-white/10 p-4">
            <div className="flex items-center gap-3 rounded-lg p-2">
              <div className="flex size-9 items-center justify-center rounded-full bg-white/10 text-sm font-medium">
                D
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium">Dancan</p>

                <p className="truncate text-xs text-white/40">Administrator</p>
              </div>
            </div>
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
};

function NavigationSection({ title, items }: NavigationSectionProps) {
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
