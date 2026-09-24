import {
  CircleAlert,
  CircleDollarSign,
  ShoppingCart,
  Users,
} from "lucide-react";

import StatCard from "@/components/dashboard/StatCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import CategoryChart from "@/components/dashboard/CategoryChart";
import ProductPerformance from "@/components/dashboard/ProductPerformance";
import AIInsights from "@/components/dashboard/AIInsights";
import LiveActivity from "@/components/dashboard/LiveActivity";
import {
  subscribeToDashboardData,
  type DashboardMetrics,
} from "@/services/dashboardService";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserProfile } from "@/services/userService";

function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const uid = user.uid;

    let unsubscribe: (() => void) | undefined;

    async function loadDashboard() {
      try {
        const profile = await getUserProfile(uid);

        if (!profile) {
          throw new Error("User profile not found.");
        }

        unsubscribe = subscribeToDashboardData(
          profile.workspaceId,
          (__, metrics) => {
            setMetrics(metrics);
          },
        );
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      }
    }

    loadDashboard();

    return () => {
      unsubscribe?.();
    };
  }, [user]);

  const stats = [
    {
      title: "Total Revenue",
      value: metrics ? `$${metrics.totalRevenue.toLocaleString()}` : "...",
      change: "+12.5%",
      icon: CircleDollarSign,
      color: "#10B981",
    },
    {
      title: "Total Orders",
      value: metrics ? metrics.totalOrders.toLocaleString() : "...",
      change: "+8.2%",
      icon: ShoppingCart,
      color: "#0EA5E9",
    },
    {
      title: "Customers",
      value: metrics ? metrics.totalCustomers.toLocaleString() : "...",
      change: "+5.4%",
      icon: Users,
      color: "#8B5CF6",
    },
    {
      title: "Low Stock",
      value: metrics ? metrics.lowStockCount.toLocaleString() : "...",
      change: "Attention",
      icon: CircleAlert,
      positive: false,
      color: "#F59E0B",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-white/60 italic">
            Here's what's happening with your business today.
          </p>
        </div>

        <button className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium transition hover:bg-white/10">
          Sep 1 – Sep 30
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Analytics */}

      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart data={metrics?.revenueByMonth ?? []} />
        <CategoryChart data={metrics?.salesByCategory ?? []} />
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <ProductPerformance data={metrics?.productPerformance ?? []} />
        <AIInsights />
      </div>

      <LiveActivity />
    </div>
  );
}

export default Dashboard;
