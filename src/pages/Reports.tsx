import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { getUserProfile } from "../services/userService";
import { subscribeToOrders } from "../services/orderService";
import { subscribeToCustomers } from "../services/customerService";
import { subscribeToProducts } from "../services/productService";
import type { Customer, Order, Product } from "../types/database";
import { FileSpreadsheet, FileText } from "lucide-react";

type DateRange = "7" | "30" | "90" | "all";

function Reports() {
  const { user } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>("30");
  const [currentTime, setCurrentTime] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;

    const userId = user.uid;

    let unsubscribeOrders: (() => void) | undefined;
    let unsubscribeCustomers: (() => void) | undefined;
    let unsubscribeProducts: (() => void) | undefined;

    async function loadReports() {
      try {
        setLoading(true);
        setCurrentTime(Date.now());

        const profile = await getUserProfile(userId);

        if (!profile) {
          throw new Error("User profile not found.");
        }

        unsubscribeOrders = subscribeToOrders(profile.workspaceId, setOrders);

        unsubscribeCustomers = subscribeToCustomers(
          profile.workspaceId,
          setCustomers,
        );

        unsubscribeProducts = subscribeToProducts(
          profile.workspaceId,
          setProducts,
        );
      } catch (error) {
        console.error("Failed to load reports:", error);
      } finally {
        setLoading(false);
      }
    }

    loadReports();

    return () => {
      unsubscribeOrders?.();
      unsubscribeCustomers?.();
      unsubscribeProducts?.();
    };
  }, [user]);

  const filteredOrders = useMemo(() => {
    if (dateRange === "all") {
      return orders;
    }

    if (currentTime === null) {
      return [];
    }

    const days = Number(dateRange);
    const cutoff = currentTime - days * 24 * 60 * 60 * 1000;

    return orders.filter((order) => order.createdAt >= cutoff);
  }, [orders, dateRange, currentTime]);

  const completedOrders = useMemo(
    () => filteredOrders.filter((order) => order.status === "completed"),
    [filteredOrders],
  );

  const totalRevenue = useMemo(
    () => completedOrders.reduce((total, order) => total + order.total, 0),
    [completedOrders],
  );

  const totalOrders = filteredOrders.length;

  const completedOrderCount = completedOrders.length;

  const averageOrderValue =
    completedOrderCount > 0 ? totalRevenue / completedOrderCount : 0;

  const totalItemsSold = useMemo(
    () =>
      completedOrders.reduce(
        (total, order) =>
          total +
          order.items.reduce((itemTotal, item) => itemTotal + item.quantity, 0),
        0,
      ),
    [completedOrders],
  );

  const orderStatusCounts = useMemo(() => {
    return filteredOrders.reduce(
      (counts, order) => {
        counts[order.status] += 1;
        return counts;
      },
      {
        pending: 0,
        processing: 0,
        completed: 0,
        cancelled: 0,
      },
    );
  }, [filteredOrders]);

  const lowStockProducts = useMemo(
    () => products.filter((product) => product.stock <= 10),
    [products],
  );

  const topProducts = useMemo(() => {
    const productSales = new Map<
      string,
      {
        product: Product;
        quantity: number;
        revenue: number;
      }
    >();

    completedOrders.forEach((order) => {
      order.items.forEach((item) => {
        const product = products.find(
          (product) => product.id === item.productId,
        );

        if (!product) return;

        const existing = productSales.get(item.productId);

        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += item.price * item.quantity;
        } else {
          productSales.set(item.productId, {
            product,
            quantity: item.quantity,
            revenue: item.price * item.quantity,
          });
        }
      });
    });

    return Array.from(productSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [completedOrders, products]);

  const topCustomers = useMemo(() => {
    const customerSales = new Map<
      string,
      {
        customer: Customer;
        orders: number;
        revenue: number;
      }
    >();

    completedOrders.forEach((order) => {
      const customer = customers.find(
        (customer) => customer.id === order.customerId,
      );

      if (!customer) return;

      const existing = customerSales.get(customer.id);

      if (existing) {
        existing.orders += 1;
        existing.revenue += order.total;
      } else {
        customerSales.set(customer.id, {
          customer,
          orders: 1,
          revenue: order.total,
        });
      }
    });

    return Array.from(customerSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [completedOrders, customers]);

  const exportData = useMemo(
    () => ({
      dateRange,

      totalRevenue,
      totalOrders,
      averageOrderValue,
      totalItemsSold,

      orderStatusCounts,

      topProducts: topProducts.map((item) => ({
        product: {
          id: item.product.id,
          name: item.product.name,
        },
        quantity: item.quantity,
        revenue: item.revenue,
      })),

      topCustomers: topCustomers.map((item) => ({
        customer: {
          id: item.customer.id,
          name: item.customer.name,
        },
        orders: item.orders,
        revenue: item.revenue,
      })),

      lowStockProducts: lowStockProducts.map((product) => ({
        id: product.id,
        name: product.name,
        stock: product.stock,
      })),
    }),
    [
      dateRange,
      totalRevenue,
      totalOrders,
      averageOrderValue,
      totalItemsSold,
      orderStatusCounts,
      topProducts,
      topCustomers,
      lowStockProducts,
    ],
  );

  const handleExportExcel = async () => {
    const { exportReportToExcel } =
      await import("../services/reportExportService");

    await exportReportToExcel(exportData);
  };

  const handleExportPDF = async () => {
    const { exportReportToPDF } =
      await import("../services/reportExportService");

    await exportReportToPDF(exportData);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-white/50">Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h1 className="text-2xl font-semibold text-white">Reports</h1>

          <p className="mt-1 text-sm text-white/50">
            Detailed business performance and sales analysis.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={dateRange}
            onChange={(event) => setDateRange(event.target.value as DateRange)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
          >
            <option value="7" className="bg-[#0C0D0F]">
              Last 7 days
            </option>

            <option value="30" className="bg-[#0C0D0F]">
              Last 30 days
            </option>

            <option value="90" className="bg-[#0C0D0F]">
              Last 90 days
            </option>

            <option value="all" className="bg-[#0C0D0F]">
              All time
            </option>
          </select>

          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
            Excel
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            <FileText className="h-4 w-4 text-red-400" />
            PDF
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-[#0C0D0F] p-5">
          <p className="text-sm text-white/50">Revenue</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            ${totalRevenue.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0C0D0F] p-5">
          <p className="text-sm text-white/50">Orders</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {totalOrders.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0C0D0F] p-5">
          <p className="text-sm text-white/50">Average order value</p>

          <p className="mt-2 text-2xl font-semibold text-white">
            $
            {averageOrderValue.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0C0D0F] p-5">
          <p className="text-sm text-white/50">Items sold</p>

          <p className="mt-2 text-2xl font-semibold text-white">
            {totalItemsSold.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Order status */}
      <div className="rounded-xl border border-white/10 bg-[#0C0D0F] p-5">
        <div className="mb-5">
          <h2 className="font-medium text-white">Order status</h2>

          <p className="mt-1 text-sm text-white/40">
            Current order distribution for the selected period.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-sm text-white/40">Pending</p>
            <p className="mt-1 text-xl font-semibold text-amber-400">
              {orderStatusCounts.pending}
            </p>
          </div>

          <div>
            <p className="text-sm text-white/40">Processing</p>
            <p className="mt-1 text-xl font-semibold text-blue-400">
              {orderStatusCounts.processing}
            </p>
          </div>

          <div>
            <p className="text-sm text-white/40">Completed</p>
            <p className="mt-1 text-xl font-semibold text-emerald-400">
              {orderStatusCounts.completed}
            </p>
          </div>

          <div>
            <p className="text-sm text-white/40">Cancelled</p>
            <p className="mt-1 text-xl font-semibold text-red-400">
              {orderStatusCounts.cancelled}
            </p>
          </div>
        </div>
      </div>

      {/* Top products + customers */}
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-[#0C0D0F] p-5">
          <h2 className="font-medium text-white">Top products</h2>

          <div className="mt-5 space-y-4">
            {topProducts.length === 0 ? (
              <p className="text-sm text-white/40">
                No completed sales in this period.
              </p>
            ) : (
              topProducts.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {item.product.name}
                    </p>

                    <p className="mt-1 text-xs text-white/40">
                      {item.quantity} units sold
                    </p>
                  </div>

                  <p className="text-sm font-medium text-white">
                    ${item.revenue.toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0C0D0F] p-5">
          <h2 className="font-medium text-white">Top customers</h2>

          <div className="mt-5 space-y-4">
            {topCustomers.length === 0 ? (
              <p className="text-sm text-white/40">
                No completed sales in this period.
              </p>
            ) : (
              topCustomers.map((item) => (
                <div
                  key={item.customer.id}
                  className="flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {item.customer.name}
                    </p>

                    <p className="mt-1 text-xs text-white/40">
                      {item.orders} completed{" "}
                      {item.orders === 1 ? "order" : "orders"}
                    </p>
                  </div>

                  <p className="text-sm font-medium text-white">
                    ${item.revenue.toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Inventory */}
      <div className="rounded-xl border border-white/10 bg-[#0C0D0F] p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-medium text-white">Inventory alerts</h2>

            <p className="mt-1 text-sm text-white/40">
              Products currently at or below the low-stock threshold.
            </p>
          </div>

          <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400">
            {lowStockProducts.length}{" "}
            {lowStockProducts.length === 1 ? "product" : "products"}
          </span>
        </div>

        {lowStockProducts.length > 0 && (
          <div className="mt-5 space-y-3">
            {lowStockProducts.slice(0, 5).map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between rounded-lg border border-white/5 px-4 py-3"
              >
                <p className="text-sm text-white">{product.name}</p>

                <span className="text-sm font-medium text-red-400">
                  {product.stock} left
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Reports;
