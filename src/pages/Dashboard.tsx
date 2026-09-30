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
import { type DashboardDateRange } from "@/services/dashboardService";
import useMetrics from "@/hooks/useMetrics";

function getChange(current: number, previous: number) {
  if (previous === 0) {
    return {
      value: current === 0 ? "0%" : "New",
      positive: current >= 0,
    };
  }

  const percentageChange = ((current - previous) / previous) * 100;

  return {
    value: `${percentageChange > 0 ? "+" : ""}${percentageChange.toFixed(1)}%`,
    positive: percentageChange >= 0,
  };
}

function Dashboard() {
  const { metrics, dateRange, setDateRange } = useMetrics();
  const comparison = metrics?.comparison;
  const isAllTime = dateRange === "all";
  const customerCount =
    metrics === null
      ? null
      : isAllTime
        ? metrics.totalCustomers
        : (comparison?.customersAdded.current ?? 0);

  const revenueChange = comparison
    ? getChange(comparison.revenue.current, comparison.revenue.previous)
    : { value: "—", positive: true };
  const ordersChange = comparison
    ? getChange(comparison.orders.current, comparison.orders.previous)
    : { value: "—", positive: true };
  const customersChange = comparison
    ? getChange(
        comparison.customersAdded.current,
        comparison.customersAdded.previous,
      )
    : { value: "—", positive: true };

  const stats = [
    {
      title: "Total Revenue",
      value: metrics ? `$${metrics.totalRevenue.toLocaleString()}` : "...",
      change: metrics ? revenueChange.value : "...",
      changeContext: comparison?.label ?? "All-time total",
      icon: CircleDollarSign,
      positive: revenueChange.positive,
    },
    {
      title: "Total Orders",
      value: metrics ? metrics.totalOrders.toLocaleString() : "...",
      change: metrics ? ordersChange.value : "...",
      changeContext: comparison?.label ?? "All-time total",
      icon: ShoppingCart,
      positive: ordersChange.positive,
    },
    {
      title: isAllTime ? "Customers" : "New Customers",
      value: customerCount?.toLocaleString() ?? "...",
      change: metrics ? customersChange.value : "...",
      changeContext: comparison
        ? isAllTime
          ? `New customers ${comparison.label}`
          : comparison.label
        : "All-time total",
      icon: Users,
      positive: customersChange.positive,
    },
    {
      title: "Low Stock",
      value: metrics ? metrics.lowStockCount.toLocaleString() : "...",
      change: metrics
        ? metrics.lowStockCount > 0
          ? "Needs attention"
          : "Healthy"
        : "...",
      changeContext: "Current stock status",
      icon: CircleAlert,
      positive: metrics ? metrics.lowStockCount === 0 : true,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-white/40">
            Overview of your business performance
          </p>
        </div>

        <select
          value={dateRange}
          onChange={(event) =>
            setDateRange(event.target.value as DashboardDateRange)
          }
          className="w-full rounded-lg border border-white/10 bg-[#0C0D0F] px-3 py-2 text-sm text-white outline-none transition focus:border-white/20 sm:w-auto"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="this-year">This year</option>
          <option value="all">All time</option>
        </select>
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
        <AIInsights metrics={metrics} />{" "}
      </div>

      <LiveActivity />
    </div>
  );
}

export default Dashboard;
