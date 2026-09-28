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

    if (topProduct) {
      generatedInsights.push({
        type: "positive",
        title: "Top revenue product",
        description: `${topProduct.name} is currently generating the highest revenue at $${topProduct.revenue.toLocaleString()}.`,
        icon: ArrowUpRight,
      });
    }

    if (metrics.lowStockCount > 0) {
      generatedInsights.push({
        type: "warning",
        title: "Inventory needs attention",
        description: `${metrics.lowStockCount} product${
          metrics.lowStockCount === 1 ? " is" : "s are"
        } currently low on stock. Review inventory before accepting more orders.`,
        icon: AlertTriangle,
      });
    } else {
      generatedInsights.push({
        type: "positive",
        title: "Inventory looks healthy",
        description: "No products are currently below the low-stock threshold.",
        icon: Package,
      });
    }

    if (metrics.totalOrders > 0) {
      const averageOrderValue = metrics.totalRevenue / metrics.totalOrders;

      generatedInsights.push({
        type: "info",
        title: "Average order value",
        description: `Customers are spending an average of $${averageOrderValue.toLocaleString(
          undefined,
          {
            maximumFractionDigits: 2,
          },
        )} per order.`,
        icon: ShoppingCart,
      });
    }

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

        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
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
        <h1 className="text-2xl font-semibold tracking-tight">AI Insights</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Intelligent insights generated from your current business data.
        </p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-lg bg-emerald-500/10 p-2.5">
              <ArrowUpRight className="h-5 w-5 text-emerald-400" />
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Revenue</p>
              <p className="mt-1 text-lg font-semibold">
                ${metrics.totalRevenue.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-lg bg-blue-500/10 p-2.5">
              <ShoppingCart className="h-5 w-5 text-blue-400" />
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Orders</p>
              <p className="mt-1 text-lg font-semibold">
                {metrics.totalOrders.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-lg bg-violet-500/10 p-2.5">
              <Users className="h-5 w-5 text-violet-400" />
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Customers</p>
              <p className="mt-1 text-lg font-semibold">
                {metrics.totalCustomers.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-lg bg-amber-500/10 p-2.5">
              <Package className="h-5 w-5 text-amber-400" />
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Low stock</p>
              <p className="mt-1 text-lg font-semibold">
                {metrics.lowStockCount}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white/5 p-2">
              <Lightbulb className="h-5 w-5 text-white" />
            </div>

            <div>
              <CardTitle>Business insights</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Key observations based on your current workspace data.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {insights.map((insight, index) => {
            const Icon = insight.icon;

            const iconClass =
              insight.type === "positive"
                ? "bg-emerald-500/10 text-emerald-400"
                : insight.type === "warning"
                  ? "bg-amber-500/10 text-amber-400"
                  : "bg-blue-500/10 text-blue-400";

            return (
              <div
                key={`${insight.title}-${index}`}
                className="flex gap-4 rounded-xl border border-white/10 bg-white/2 p-4"
              >
                <div className={`shrink-0 rounded-lg p-2 ${iconClass}`}>
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

      {/* Opportunity */}
      <Card>
        <CardHeader>
          <CardTitle>What to focus on</CardTitle>
        </CardHeader>

        <CardContent>
          {metrics.lowStockCount > 0 ? (
            <div className="flex gap-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <ArrowDownRight className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />

              <div>
                <p className="text-sm font-medium text-white">
                  Review inventory
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Several products have limited stock. Consider reviewing
                  inventory levels before processing additional orders.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex gap-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <ArrowUpRight className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />

              <div>
                <p className="text-sm font-medium text-white">
                  Keep monitoring performance
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Current inventory levels do not indicate an immediate stock
                  issue. Continue monitoring revenue and order activity.
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
