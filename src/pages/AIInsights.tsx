import { useMemo } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Lightbulb,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ProductPerformance = {
  id: string;
  name: string;
  orders: number;
  revenue: number;
  stock: number;
};

type DashboardMetrics = {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  lowStockCount: number;
  productPerformance: ProductPerformance[];
};

type AIInsightsProps = {
  metrics: DashboardMetrics | null;
};

function AIInsights({ metrics }: AIInsightsProps) {
  const insights = useMemo(() => {
    if (!metrics) return [];

    const generatedInsights: {
      type: "positive" | "warning" | "info";
      title: string;
      description: string;
      icon: typeof Lightbulb;
    }[] = [];

    const topProduct = [...metrics.productPerformance].sort(
      (a, b) => b.revenue - a.revenue,
    )[0];

    const lowStockProducts = metrics.productPerformance.filter(
      (product) => product.stock <= 10,
    );

    // Revenue leader
    if (topProduct) {
      generatedInsights.push({
        type: "positive",
        title: "Top revenue driver",
        description: `${topProduct.name} is currently generating the highest revenue at $${topProduct.revenue.toLocaleString()}.`,
        icon: ArrowUpRight,
      });
    }

    // Inventory health
    if (metrics.lowStockCount > 0) {
      generatedInsights.push({
        type: "warning",
        title: "Inventory needs attention",
        description: `${metrics.lowStockCount} product${
          metrics.lowStockCount === 1 ? " is" : "s are"
        } currently below the low-stock threshold.`,
        icon: AlertTriangle,
      });
    } else {
      generatedInsights.push({
        type: "positive",
        title: "Inventory is stable",
        description:
          "No products are currently below the configured low-stock threshold.",
        icon: Package,
      });
    }

    // Average order value
    if (metrics.totalOrders > 0) {
      const averageOrderValue = metrics.totalRevenue / metrics.totalOrders;

      generatedInsights.push({
        type: "info",
        title: "Average order value",
        description: `The current average order value is $${averageOrderValue.toLocaleString(
          undefined,
          {
            maximumFractionDigits: 2,
          },
        )}.`,
        icon: ShoppingCart,
      });
    }

    // Customer activity
    if (metrics.totalCustomers > 0 && metrics.totalOrders > 0) {
      const ordersPerCustomer = metrics.totalOrders / metrics.totalCustomers;

      generatedInsights.push({
        type: "info",
        title: "Customer activity",
        description: `The workspace is averaging ${ordersPerCustomer.toFixed(
          2,
        )} orders per customer.`,
        icon: Users,
      });
    }

    // Specific products requiring attention
    if (lowStockProducts.length > 0) {
      const productNames = lowStockProducts
        .slice(0, 3)
        .map((product) => product.name)
        .join(", ");

      generatedInsights.push({
        type: "warning",
        title: "Products to watch",
        description:
          lowStockProducts.length > 3
            ? `${productNames}, and ${
                lowStockProducts.length - 3
              } more product${
                lowStockProducts.length - 3 === 1 ? "" : "s"
              } have limited stock.`
            : `${productNames} ${
                lowStockProducts.length === 1 ? "has" : "have"
              } limited stock.`,
        icon: AlertTriangle,
      });
    }

    return generatedInsights;
  }, [metrics]);

  if (!metrics) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI Insights</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Intelligent business insights from your workspace data.
          </p>
        </div>

        <Card className="border-white/6 bg-[#0C0D0F]">
          <CardContent className="flex min-h-48 items-center justify-center text-sm text-muted-foreground">
            Analyzing your business data...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
            <Lightbulb className="h-4 w-4 text-violet-400" />
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">AI Insights</h1>
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          Key business observations generated from your current workspace data.
        </p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/6 bg-[#0C0D0F] shadow-none">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-xl bg-emerald-500/10 p-2.5">
              <ArrowUpRight className="h-5 w-5 text-emerald-400" />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Revenue</p>

              <p className="mt-1 truncate text-lg font-semibold text-white">
                ${metrics.totalRevenue.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/6 bg-[#0C0D0F] shadow-none">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-xl bg-sky-500/10 p-2.5">
              <ShoppingCart className="h-5 w-5 text-sky-400" />
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Orders</p>

              <p className="mt-1 text-lg font-semibold text-white">
                {metrics.totalOrders.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/6 bg-[#0C0D0F] shadow-none">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-xl bg-violet-500/10 p-2.5">
              <Users className="h-5 w-5 text-violet-400" />
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Customers</p>

              <p className="mt-1 text-lg font-semibold text-white">
                {metrics.totalCustomers.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/6 bg-[#0C0D0F] shadow-none">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-xl bg-amber-500/10 p-2.5">
              <Package className="h-5 w-5 text-amber-400" />
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Low stock</p>

              <p className="mt-1 text-lg font-semibold text-white">
                {metrics.lowStockCount}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main insights */}
      <Card className="border-white/6 bg-[#0C0D0F] shadow-none">
        <CardHeader className="border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10">
              <Lightbulb className="h-5 w-5 text-violet-400" />
            </div>

            <div>
              <CardTitle className="text-base">Business insights</CardTitle>

              <p className="mt-1 text-xs text-muted-foreground">
                Key observations based on current workspace activity.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pt-5">
          {insights.map((insight, index) => {
            const Icon = insight.icon;

            const iconClass =
              insight.type === "positive"
                ? "bg-emerald-500/10 text-emerald-400"
                : insight.type === "warning"
                  ? "bg-amber-500/10 text-amber-400"
                  : "bg-sky-500/10 text-sky-400";

            return (
              <div
                key={`${insight.title}-${index}`}
                className="flex gap-4 rounded-xl border border-white/5 bg-[#101114] p-4 transition-colors hover:border-white/9"
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconClass}`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-white">
                    {insight.title}
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {insight.description}
                  </p>
                </div>
              </div>
            );
          })}

          {insights.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Not enough data to generate insights yet.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Focus area */}
      <Card className="border-white/6 bg-[#0C0D0F] shadow-none">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Recommended focus</CardTitle>

          <p className="text-xs text-muted-foreground">
            The most relevant action based on current metrics.
          </p>
        </CardHeader>

        <CardContent>
          {metrics.lowStockCount > 0 ? (
            <div className="flex gap-4 rounded-xl border border-amber-500/15 bg-amber-500/4 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                <ArrowDownRight className="h-4 w-4 text-amber-400" />
              </div>

              <div>
                <p className="text-sm font-medium text-white">
                  Review inventory
                </p>

                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {metrics.lowStockCount} product
                  {metrics.lowStockCount === 1 ? " is" : "s are"} below the
                  low-stock threshold. Review replenishment levels before
                  processing additional demand.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex gap-4 rounded-xl border border-emerald-500/15 bg-emerald-500/4 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                <ArrowUpRight className="h-4 w-4 text-emerald-400" />
              </div>

              <div>
                <p className="text-sm font-medium text-white">
                  Monitor performance
                </p>

                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Inventory is currently above the low-stock threshold. Continue
                  monitoring revenue, orders, and customer activity for changes.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AIInsights;
