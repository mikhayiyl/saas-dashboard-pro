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
    <div className="rounded-xl border border-white/10 bg-[#0C0D0F] p-5">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-white/70" />
          <h2 className="font-semibold">AI Insights</h2>
        </div>

        <p className="mt-1 text-sm text-white/40">
          AI-generated insights from your business data
        </p>
      </div>

      {isLoading && (
        <div className="py-8 text-center">
          <p className="text-sm text-white/40">
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
                className="rounded-lg border border-white/5 bg-white/2 p-4"
              >
                <div className="flex gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/5">
                    <Icon className="size-4 text-white/60" />
                  </div>

                  <div className="min-w-0">
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
      )}
    </div>
  );
};

export default AIInsights;
