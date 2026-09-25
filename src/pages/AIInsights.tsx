import { AlertTriangle, ArrowUpRight, Sparkles } from "lucide-react";

import type { DashboardMetrics } from "@/services/dashboardService";

type AIInsightsProps = {
  metrics: DashboardMetrics | null;
};

type Insight = {
  type: "positive" | "warning" | "info";
  title: string;
  description: string;
};

const insightIcons = {
  positive: ArrowUpRight,
  warning: AlertTriangle,
  info: Sparkles,
};

function generateInsights(metrics: DashboardMetrics): Insight[] {
  const insights: Insight[] = [];

  if (metrics.totalRevenue > 0) {
    insights.push({
      type: "positive",
      title: "Revenue is active",
      description: `Your business has generated $${metrics.totalRevenue.toLocaleString()} in revenue.`,
    });
  }

  if (metrics.lowStockCount > 0) {
    insights.push({
      type: "warning",
      title: "Low stock detected",
      description: `${metrics.lowStockCount} product${
        metrics.lowStockCount !== 1 ? "s" : ""
      } need${metrics.lowStockCount === 1 ? "s" : ""} attention.`,
    });
  }

  if (metrics.totalOrders > 0) {
    insights.push({
      type: "info",
      title: "Orders are coming in",
      description: `You have ${metrics.totalOrders.toLocaleString()} completed orders in the selected period.`,
    });
  }

  return insights;
}

const AIInsights = ({ metrics }: AIInsightsProps) => {
  if (!metrics) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#0C0D0F] p-5">
        <p className="text-sm text-white/40">Loading insights...</p>
      </div>
    );
  }

  const insights = generateInsights(metrics);

  return (
    <div className="rounded-xl border border-white/10 bg-[#0C0D0F] p-5">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-white/70" />
          <h2 className="font-semibold">AI Insights</h2>
        </div>

        <p className="mt-1 text-sm text-white/40">
          Highlights from your business data
        </p>
      </div>

      <div className="space-y-3">
        {insights.map((insight) => {
          const Icon = insightIcons[insight.type];

          return (
            <div
              key={insight.title}
              className="rounded-lg border border-white/5 bg-white/2 p-4"
            >
              <div className="flex gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/5">
                  <Icon className="size-4 text-white/60" />
                </div>

                <div>
                  <p className="text-sm font-medium">{insight.title}</p>

                  <p className="mt-1 text-sm leading-5 text-white/40">
                    {insight.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AIInsights;
