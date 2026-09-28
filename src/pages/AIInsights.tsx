import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  CircleDollarSign,
  Lightbulb,
  LoaderCircle,
  RefreshCw,
  ShoppingCart,
  Sparkles,
  Users,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { generateBusinessInsights } from "../services/aiService";
import type { AIInsight } from "../services/aiService";
import {
  subscribeToDashboardData,
  type DashboardDateRange,
  type DashboardMetrics,
} from "../services/dashboardService";
import { getUserProfile } from "../services/userService";

const dateRangeOptions: { value: DashboardDateRange; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "this-year", label: "This year" },
  { value: "all", label: "All time" },
];

const insightStyles = {
  positive: {
    icon: ArrowUpRight,
    accent: "text-emerald-300",
    surface: "border-emerald-300/15 bg-emerald-300/5",
    iconSurface: "bg-emerald-300/10",
    label: "Opportunity",
  },
  warning: {
    icon: AlertTriangle,
    accent: "text-amber-300",
    surface: "border-amber-300/15 bg-amber-300/5",
    iconSurface: "bg-amber-300/10",
    label: "Needs attention",
  },
  info: {
    icon: Lightbulb,
    accent: "text-sky-300",
    surface: "border-sky-300/15 bg-sky-300/5",
    iconSurface: "bg-sky-300/10",
    label: "Observation",
  },
};

function formatCurrency(value: number) {
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function formatMonth(value: string) {
  const [year, month] = value.split("-").map(Number);
  return new Date(year, month - 1).toLocaleDateString(undefined, {
    month: "short",
    year: "2-digit",
  });
}

function AIInsights() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [dateRange, setDateRange] = useState<DashboardDateRange>("30d");
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [insightError, setInsightError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    if (!user) {
      setIsLoadingMetrics(false);
      return;
    }

    const userId = user.uid;
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    setMetrics(null);
    setDataError(null);
    setIsLoadingMetrics(true);

    async function loadMetrics() {
      try {
        const profile = await getUserProfile(userId);

        if (!profile) {
          throw new Error("User profile not found.");
        }

        if (cancelled) return;

        unsubscribe = subscribeToDashboardData(
          profile.workspaceId,
          (_, nextMetrics) => {
            if (cancelled) return;
            setMetrics(nextMetrics);
            setIsLoadingMetrics(false);
          },
          dateRange,
        );
      } catch (error) {
        console.error("Failed to load AI insight data:", error);

        if (!cancelled) {
          setDataError("Business data could not be loaded. Please try again.");
          setIsLoadingMetrics(false);
        }
      }
    }

    loadMetrics();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [user, dateRange, loadAttempt]);

  useEffect(() => {
    if (!metrics) {
      setInsights([]);
      setInsightError(null);
      setIsGenerating(false);
      return;
    }

    const currentMetrics = metrics;
    const hasBusinessData =
      currentMetrics.totalOrders > 0 ||
      currentMetrics.totalCustomers > 0 ||
      currentMetrics.productPerformance.length > 0;

    if (!hasBusinessData) {
      setInsights([]);
      setInsightError(null);
      setIsGenerating(false);
      return;
    }

    let cancelled = false;

    async function loadInsights() {
      try {
        setIsGenerating(true);
        setInsightError(null);

        const result = await generateBusinessInsights(currentMetrics);

        if (!cancelled) {
          setInsights(result);
        }
      } catch (error) {
        console.error("Failed to generate AI insights:", error);

        if (!cancelled) {
          setInsightError(
            "Insights could not be generated right now. Check your connection and try again.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsGenerating(false);
        }
      }
    }

    loadInsights();

    return () => {
      cancelled = true;
    };
  }, [metrics, generation]);

  const lowStockProducts = metrics?.productPerformance
    .filter((product) => product.stock <= 10)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5);
  const revenueMonths = metrics?.revenueByMonth.slice(-6) ?? [];
  const maxMonthlyRevenue = Math.max(
    1,
    ...revenueMonths.map((month) => month.revenue),
  );
  const topCategories = metrics?.salesByCategory.slice(0, 5) ?? [];
  const maxCategoryRevenue = Math.max(
    1,
    ...topCategories.map((category) => category.revenue),
  );
  const hasBusinessData = Boolean(
    metrics &&
    (metrics.totalOrders > 0 ||
      metrics.totalCustomers > 0 ||
      metrics.productPerformance.length > 0),
  );

  const metricCards = metrics
    ? [
        {
          label: "Completed revenue",
          value: formatCurrency(metrics.totalRevenue),
          note: "For the selected period",
          icon: CircleDollarSign,
          color: "text-emerald-300",
        },
        {
          label: "Completed orders",
          value: metrics.totalOrders.toLocaleString(),
          note: "For the selected period",
          icon: ShoppingCart,
          color: "text-sky-300",
        },
        {
          label: "Customers",
          value: metrics.totalCustomers.toLocaleString(),
          note: "Across your workspace",
          icon: Users,
          color: "text-orange-300",
        },
        {
          label: "Low-stock products",
          value: metrics.lowStockCount.toLocaleString(),
          note: "10 units or fewer",
          icon: AlertTriangle,
          color: metrics.lowStockCount > 0 ? "text-amber-300" : "text-white/50",
        },
      ]
    : [];

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-emerald-300/15 bg-emerald-300/8">
            <Sparkles className="size-5 text-emerald-300" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white">AI Insights</h1>
            <p className="mt-1 text-sm text-white/50">
              Practical signals from your sales, customers, and inventory.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="insights-date-range">
            Analysis period
          </label>
          <select
            id="insights-date-range"
            value={dateRange}
            onChange={(event) =>
              setDateRange(event.target.value as DashboardDateRange)
            }
            className="min-h-10 rounded-lg border border-white/10 bg-[#0C0D0F] px-3 text-sm text-white outline-none transition focus:border-white/25"
          >
            {dateRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setGeneration((current) => current + 1)}
            disabled={!metrics || !hasBusinessData || isGenerating}
            title="Generate fresh insights"
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RefreshCw
              className={`size-4 ${isGenerating ? "animate-spin" : ""}`}
            />
            Refresh insights
          </button>
        </div>
      </header>

      {dataError && !isLoadingMetrics && (
        <div className="flex flex-col justify-between gap-4 rounded-xl border border-red-400/20 bg-red-400/5 p-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-300" />
            <div>
              <p className="text-sm font-medium text-white">
                Unable to load business data
              </p>
              <p className="mt-1 text-sm text-white/50">{dataError}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setLoadAttempt((current) => current + 1)}
            className="inline-flex min-h-9 items-center gap-2 self-start rounded-md border border-white/10 px-3 text-sm text-white transition hover:bg-white/5 sm:self-auto"
          >
            <RefreshCw className="size-4" />
            Retry
          </button>
        </div>
      )}

      {isLoadingMetrics ? (
        <div className="flex min-h-56 items-center justify-center rounded-xl border border-white/8 bg-[#0C0D0F]">
          <div className="flex items-center gap-3 text-sm text-white/50">
            <LoaderCircle className="size-4 animate-spin text-emerald-300" />
            Loading your workspace data...
          </div>
        </div>
      ) : (
        metrics && (
          <>
            <section
              aria-label="Business metrics"
              className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
            >
              {metricCards.map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.label}
                    className="min-w-0 rounded-xl border border-white/8 bg-[#0C0D0F] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm text-white/50">
                        {card.label}
                      </p>
                      <Icon className={`size-4 shrink-0 ${card.color}`} />
                    </div>
                    <p className="mt-3 truncate text-2xl font-semibold text-white">
                      {card.value}
                    </p>
                    <p className="mt-1 text-xs text-white/35">{card.note}</p>
                  </div>
                );
              })}
            </section>

            <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.85fr)]">
              <section className="min-w-0 rounded-xl border border-white/8 bg-[#0C0D0F] p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/8 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-4 text-emerald-300" />
                      <h2 className="font-semibold text-white">
                        Generated recommendations
                      </h2>
                    </div>
                    <p className="mt-1 text-sm text-white/40">
                      Analysis based on your{" "}
                      {dateRangeOptions
                        .find((item) => item.value === dateRange)
                        ?.label.toLowerCase()}{" "}
                      data
                    </p>
                  </div>
                  {hasBusinessData && !isGenerating && !insightError && (
                    <span className="rounded-full border border-white/8 px-2.5 py-1 text-xs text-white/45">
                      {insights.length}{" "}
                      {insights.length === 1 ? "finding" : "findings"}
                    </span>
                  )}
                </div>

                {isGenerating && (
                  <div className="flex items-center gap-2 py-4 text-sm text-white/45">
                    <LoaderCircle className="size-4 animate-spin text-emerald-300" />
                    {insights.length > 0
                      ? "Updating analysis..."
                      : "Analyzing your business data..."}
                  </div>
                )}

                {insightError && (
                  <div className="mt-4 flex flex-col justify-between gap-3 rounded-lg border border-amber-300/15 bg-amber-300/5 p-4 sm:flex-row sm:items-center">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-300" />
                      <p className="text-sm text-white/65">{insightError}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setGeneration((current) => current + 1)}
                      className="inline-flex min-h-8 items-center gap-2 self-start rounded-md px-2 text-sm font-medium text-amber-200 transition hover:bg-amber-200/5 sm:self-auto"
                    >
                      <RefreshCw className="size-3.5" />
                      Try again
                    </button>
                  </div>
                )}

                {!hasBusinessData && !dataError && (
                  <div className="py-12 text-center">
                    <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-white/5">
                      <Sparkles className="size-5 text-white/40" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-white/75">
                      More data, sharper insights
                    </p>
                    <p className="mx-auto mt-1 max-w-sm text-sm text-white/40">
                      Add products or record completed orders to get tailored
                      recommendations for your business.
                    </p>
                  </div>
                )}

                {insights.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {insights.map((insight, index) => {
                      const style = insightStyles[insight.type];
                      const Icon = style.icon;

                      return (
                        <article
                          key={`${insight.type}-${insight.title}-${index}`}
                          className={`rounded-lg border p-4 ${style.surface}`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`flex size-9 shrink-0 items-center justify-center rounded-md ${style.iconSurface}`}
                            >
                              <Icon className={`size-4 ${style.accent}`} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <h3 className="text-sm font-semibold text-white">
                                  {insight.title}
                                </h3>
                                <span className={`text-xs ${style.accent}`}>
                                  {style.label}
                                </span>
                              </div>
                              <p className="mt-1.5 text-sm leading-6 text-white/55">
                                {insight.description}
                              </p>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}

                {!isGenerating &&
                  !insightError &&
                  hasBusinessData &&
                  insights.length === 0 && (
                    <p className="py-8 text-center text-sm text-white/45">
                      No recommendations are available for this period yet.
                    </p>
                  )}
              </section>

              <aside className="space-y-5">
                <section className="rounded-xl border border-white/8 bg-[#0C0D0F] p-5">
                  <div className="mb-5">
                    <h2 className="text-sm font-semibold text-white">
                      Revenue by month
                    </h2>
                    <p className="mt-1 text-xs text-white/40">
                      Completed orders in the selected period
                    </p>
                  </div>
                  {revenueMonths.length > 0 ? (
                    <div className="space-y-4">
                      {revenueMonths.map((month) => (
                        <div key={month.month}>
                          <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                            <span className="text-white/50">
                              {formatMonth(month.month)}
                            </span>
                            <span className="font-medium text-white/75">
                              {formatCurrency(month.revenue)}
                            </span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-white/6">
                            <div
                              className="h-full rounded-full bg-emerald-300/80 transition-[width]"
                              style={{
                                width: `${Math.max(3, (month.revenue / maxMonthlyRevenue) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="py-5 text-sm text-white/40">
                      No completed sales in this period.
                    </p>
                  )}
                </section>

                <section className="rounded-xl border border-white/8 bg-[#0C0D0F] p-5">
                  <div className="mb-5">
                    <h2 className="text-sm font-semibold text-white">
                      Sales by category
                    </h2>
                    <p className="mt-1 text-xs text-white/40">
                      Revenue from completed orders
                    </p>
                  </div>
                  {topCategories.length > 0 ? (
                    <div className="space-y-4">
                      {topCategories.map((category, index) => (
                        <div key={category.category}>
                          <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                            <span className="truncate text-white/55">
                              {category.category}
                            </span>
                            <span className="shrink-0 font-medium text-white/75">
                              {formatCurrency(category.revenue)}
                            </span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-white/6">
                            <div
                              className={`h-full rounded-full ${["bg-sky-300/80", "bg-orange-300/80", "bg-emerald-300/80", "bg-amber-300/80", "bg-rose-300/80"][index]}`}
                              style={{
                                width: `${Math.max(3, (category.revenue / maxCategoryRevenue) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="py-5 text-sm text-white/40">
                      Category sales will appear after completed orders.
                    </p>
                  )}
                </section>

                <section className="rounded-xl border border-white/8 bg-[#0C0D0F] p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold text-white">
                        Inventory watch
                      </h2>
                      <p className="mt-1 text-xs text-white/40">
                        Products with 10 units or fewer
                      </p>
                    </div>
                    <span className="rounded-md border border-amber-300/15 bg-amber-300/5 px-2 py-1 text-xs text-amber-200">
                      {metrics.lowStockCount} low
                    </span>
                  </div>
                  {lowStockProducts && lowStockProducts.length > 0 ? (
                    <div className="divide-y divide-white/6">
                      {lowStockProducts.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                        >
                          <span className="min-w-0 truncate text-sm text-white/65">
                            {product.name}
                          </span>
                          <span className="shrink-0 text-sm font-medium text-amber-200">
                            {product.stock} left
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-emerald-200/75">
                      No products currently need a restock check.
                    </p>
                  )}
                </section>
              </aside>
            </div>
          </>
        )
      )}
    </div>
  );
}

export default AIInsights;
