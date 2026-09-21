import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Sparkles,
  Settings,
} from "lucide-react";

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

function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 w-64 border-r border-white/10 bg-[#0C0D0F]">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-white/10 px-6">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-white text-black">
              N
            </div>

            <span className="text-lg font-semibold tracking-tight">NOVA</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-6 p-4">
          <div>
            <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-white/40">
              Main
            </p>

            <div className="space-y-1">
              {mainNavigation.map((item) => {
                const Icon = item.icon;

                return (
                  <a
                    key={item.name}
                    href={item.path}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
                  >
                    <Icon className="size-4" />
                    {item.name}
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-white/40">
              Analytics
            </p>

            <div className="space-y-1">
              {analyticsNavigation.map((item) => {
                const Icon = item.icon;

                return (
                  <a
                    key={item.name}
                    href={item.path}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
                  >
                    <Icon className="size-4" />
                    {item.name}
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-white/40">
              System
            </p>

            <a
              href="/settings"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
            >
              <Settings className="size-4" />
              Settings
            </a>
          </div>
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
  );
}

export default Sidebar;
