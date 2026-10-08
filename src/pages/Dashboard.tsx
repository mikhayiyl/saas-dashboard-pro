import {
  CircleAlert,
  CircleDollarSign,
  Package,
  ShoppingCart,
  Tag,
  Users,
  CalendarDays,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

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
    value: `${percentageChange > 0 ? "+" : ""}${percentageChange.toLocaleString(
      undefined,
      { maximumFractionDigits: 1 },
    )}%`,
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

  const topCategory = metrics?.salesByCategory.reduce<
    { category: string; revenue: number } | undefined
  >((top, category) => (!top || category.revenue > top.revenue ? category : top), undefined);
  const categoryRevenue =
    metrics?.salesByCategory.reduce((total, category) => total + category.revenue, 0) ??
    0;
  const topCategoryShare =
    topCategory && categoryRevenue > 0
      ? Math.round((topCategory.revenue / categoryRevenue) * 100)
      : null;
  return (
    <div className="space-y-6">
      <section className="dashboard-hero relative isolate overflow-hidden rounded-2xl border border-[#304267] bg-gradient-to-br from-[#1b2c51] via-[#14223d] to-[#1c2040] px-5 py-5 shadow-[0_24px_70px_-48px_rgba(52,91,215,0.5)] sm:px-7 sm:py-6">
        <div className="pointer-events-none absolute -right-14 -top-28 -z-10 size-72 rounded-full bg-[#829fff]/[0.12] blur-3xl" />
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
          <div>
            <h1 className="flex items-center gap-2.5 text-[28px] font-semibold leading-tight tracking-[-0.04em] text-[#f3f6ff] sm:text-[30px]">
              <Sparkles className="size-5 text-[#aebfff]" />
              Business Pulse
            </h1>
            <p className="mt-1.5 max-w-2xl text-[13px] leading-5 text-[#b0bdd5]">
              Monitor revenue growth, customer activity, inventory health, and
              key business insights in one place.
            </p>

            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-7">
              <div className="flex min-w-0 items-center gap-2.5">
                <Tag className="size-4 shrink-0 text-[#b7a5ff]" />
                <span className="truncate text-sm text-[#d5def1]">
                  {topCategory && topCategoryShare !== null
                    ? `${topCategory.category} leads sales (${topCategoryShare}%)`
                    : "Category performance unavailable"}
                </span>
              </div>
              <div className="flex min-w-0 items-center gap-2.5">
                <Package
                  className={`size-4 shrink-0 ${
                    metrics?.lowStockCount ? "text-[#ffd08c]" : "text-[#8fdbca]"
                  }`}
                />
                <span className="truncate text-sm text-[#d5def1]">
                  {metrics
                    ? metrics.lowStockCount > 0
                      ? `${metrics.lowStockCount} ${
                          metrics.lowStockCount === 1 ? "product requires" : "products require"
                        } restocking`
                      : "Inventory levels are healthy"
                    : "Inventory status loading"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <label className="relative flex min-w-[150px] flex-1 items-center lg:flex-none">
              <CalendarDays className="pointer-events-none absolute left-3.5 size-4 text-[#99a9c6]" />
              <select
                value={dateRange}
                onChange={(event) =>
                  setDateRange(event.target.value as DashboardDateRange)
                }
                aria-label="Dashboard date range"
                className="w-full appearance-none rounded-xl border border-white/[0.13] bg-[#101c32] py-2.5 pl-10 pr-4 text-[13px] font-medium text-[#e7edfc] outline-none transition hover:border-white/25 focus:border-[#91aaff]/60 focus:ring-4 focus:ring-[#5476e8]/[0.14]"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="this-year">This year</option>
                <option value="all">All time</option>
              </select>
            </label>
            <Link
              to="/reports"
              className="inline-flex flex-1 items-center justify-center rounded-xl border border-white/[0.13] bg-white/[0.05] px-3 py-2.5 text-[13px] font-semibold text-[#e0e8fa] transition hover:border-white/25 hover:bg-white/[0.09] lg:flex-none"
            >
              View Reports
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Analytics */}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(280px,0.8fr)]">
        <RevenueChart data={metrics?.revenueByMonth ?? []} />
        <CategoryChart data={metrics?.salesByCategory ?? []} />
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.8fr)]">
        <ProductPerformance data={metrics?.productPerformance ?? []} />
        <AIInsights metrics={metrics} />{" "}
      </div>

      <LiveActivity />
    </div>
  );
}

export default Dashboard;
