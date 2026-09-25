import type { DashboardMetrics } from "@/services/dashboardService";

type AIInsightsProps = {
  metrics: DashboardMetrics | null;
};

const AIInsights = ({ metrics }: AIInsightsProps) => {
  if (!metrics) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#0C0D0F] p-5">
        <p className="text-sm text-white/40">Loading insights...</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#0C0D0F] p-5">
      <div>
        <h2 className="font-semibold">AI Insights</h2>
        <p className="mt-1 text-sm text-white/40">
          Business insights based on your dashboard data
        </p>
      </div>

      <div className="mt-5 space-y-3">
        <p className="text-sm text-white/70">
          Revenue: ${metrics.totalRevenue.toLocaleString()}
        </p>

        <p className="text-sm text-white/70">
          Orders: {metrics.totalOrders.toLocaleString()}
        </p>

        <p className="text-sm text-white/70">
          Customers: {metrics.totalCustomers.toLocaleString()}
        </p>

        <p className="text-sm text-white/70">
          Low-stock products: {metrics.lowStockCount}
        </p>
      </div>
    </div>
  );
};

export default AIInsights;
