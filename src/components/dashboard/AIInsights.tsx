import { AlertTriangle, ArrowUpRight, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { generateBusinessInsights } from "@/services/aiService";
import type { DashboardMetrics } from "@/services/dashboardService";
import type { AIInsight } from "@/services/aiService";

type AIInsightsProps = {
  metrics: DashboardMetrics | null;
};

const insightIcons = {
  positive: ArrowUpRight,
  warning: AlertTriangle,
  info: Sparkles,
};

const AIInsights = ({ metrics }: AIInsightsProps) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!metrics) return;

    const currentMetrics = metrics;
    let cancelled = false;

    async function loadInsights() {
      try {
        setIsLoading(true);
        setError(null);

        const result = await generateBusinessInsights(currentMetrics);

        if (!cancelled) {
          setInsights(result);
        }
      } catch (error) {
        console.error("Failed to generate AI insights:", error);

        if (!cancelled) {
          setError("Unable to generate AI insights.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadInsights();

    return () => {
      cancelled = true;
    };
  }, [metrics]);
  return (
    <div className="dashboard-panel rounded-2xl border border-[#39395d] bg-gradient-to-b from-[#1b2040] to-[#121f38] p-5 sm:p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-[#b7a5ff]" />
          <h2 className="text-[15px] font-semibold">AI Insights</h2>
        </div>

        <p className="mt-1 text-sm text-[#99a8c4]">
          AI-generated signals from your business data
        </p>
      </div>

      {isLoading && (
        <div className="py-8 text-center">
          <p className="text-sm text-slate-400">
            Analyzing your business data...
          </p>
        </div>
      )}

      {error && !isLoading && (
        <div className="rounded-lg border border-red-500/10 bg-red-500/5 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <div className="space-y-3">
          {insights.map((insight) => {
            const Icon = insightIcons[insight.type];

            return (
              <div
                key={`${insight.title}-${insight.type}`}
                className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4"
              >
                <div className="flex gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#8a72e8]/[0.13]">
                    <Icon className="size-4 text-[#b7a5ff]" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-medium">{insight.title}</p>

                    <p className="mt-1 text-sm leading-5 text-slate-400">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AIInsights;
