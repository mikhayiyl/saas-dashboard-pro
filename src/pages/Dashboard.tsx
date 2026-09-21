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

const stats = [
  {
    title: "Total Revenue",
    value: "$84,250",
    change: "+12.5%",
    icon: CircleDollarSign,
  },
  {
    title: "Total Orders",
    value: "1,284",
    change: "+8.2%",
    icon: ShoppingCart,
  },
  {
    title: "Customers",
    value: "3,842",
    change: "+5.4%",
    icon: Users,
  },
  {
    title: "Low Stock",
    value: "12",
    change: "Attention",
    icon: CircleAlert,
    positive: false,
  },
];

function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

          <p className="mt-1 text-sm text-white/50">
            Here's what's happening with your business today.
          </p>
        </div>

        <button className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium transition hover:bg-white/10">
          Sep 1 – Sep 30
        </button>
      </div>
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>
      {/* Analytics */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <RevenueChart />
        <CategoryChart />
      </div>
      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <ProductPerformance />
        <AIInsights />
      </div>
      <LiveActivity />
    </div>
  );
}

export default Dashboard;
