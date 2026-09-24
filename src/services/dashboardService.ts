import { onValue, ref } from "firebase/database";

import { db } from "../lib/Firebase";
import type { Customer, Order, Product } from "../types/database";

type DashboardData = {
  products: Product[];
  customers: Customer[];
  orders: Order[];
};

export function subscribeToDashboardData(
  workspaceId: string,
  callback: (data: DashboardData, metrics: DashboardMetrics) => void,
) {
  const productsRef = ref(db, `workspaces/${workspaceId}/products`);

  const customersRef = ref(db, `workspaces/${workspaceId}/customers`);

  const ordersRef = ref(db, `workspaces/${workspaceId}/orders`);

  let products: Product[] = [];
  let customers: Customer[] = [];
  let orders: Order[] = [];

  const emit = () => {
    const data = {
      products,
      customers,
      orders,
    };

    callback(data, calculateDashboardMetrics(data));
  };

  const unsubscribeProducts = onValue(productsRef, (snapshot) => {
    products = [];

    snapshot.forEach((childSnapshot) => {
      const product = childSnapshot.val() as Product;

      products.push({
        ...product,
        id: childSnapshot.key ?? product.id,
      });
    });

    emit();
  });

  const unsubscribeCustomers = onValue(customersRef, (snapshot) => {
    customers = [];

    snapshot.forEach((childSnapshot) => {
      const customer = childSnapshot.val() as Customer;

      customers.push({
        ...customer,
        id: childSnapshot.key ?? customer.id,
      });
    });

    emit();
  });

  const unsubscribeOrders = onValue(ordersRef, (snapshot) => {
    orders = [];

    snapshot.forEach((childSnapshot) => {
      const order = childSnapshot.val() as Order;

      orders.push({
        ...order,
        id: childSnapshot.key ?? order.id,
      });
    });

    emit();
  });

  return () => {
    unsubscribeProducts();
    unsubscribeCustomers();
    unsubscribeOrders();
  };
}

export type DashboardMetrics = {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  lowStockCount: number;

  revenueByMonth: {
    month: string;
    revenue: number;
    orders: number;
  }[];

  salesByCategory: {
    category: string;
    revenue: number;
  }[];

  productPerformance: {
    id: string;
    name: string;
    orders: number;
    revenue: number;
    stock: number;
  }[];
};

export function calculateDashboardMetrics(
  data: DashboardData,
): DashboardMetrics {
  const { products, customers, orders } = data;

  const completedOrders = orders.filter(
    (order) => order.status === "completed",
  );

  const totalRevenue = completedOrders.reduce(
    (sum, order) => sum + order.total,
    0,
  );

  const totalOrders = completedOrders.length;

  const totalCustomers = customers.length;

  const lowStockCount = products.filter(
    (product) => product.stock <= 10,
  ).length;

  const revenueByMonthMap = new Map<
    string,
    {
      revenue: number;
      orders: number;
      timestamp: number;
    }
  >();

  for (const order of completedOrders) {
    const date = new Date(order.createdAt);

    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1,
    ).padStart(2, "0")}`;

    const existing = revenueByMonthMap.get(monthKey);

    if (existing) {
      existing.revenue += order.total;
      existing.orders += 1;
    } else {
      revenueByMonthMap.set(monthKey, {
        revenue: order.total,
        orders: 1,
        timestamp: date.getTime(),
      });
    }
  }

  const revenueByMonth = Array.from(revenueByMonthMap.entries())
    .sort((a, b) => a[1].timestamp - b[1].timestamp)
    .map(([month, data]) => ({
      month,
      revenue: data.revenue,
      orders: data.orders,
    }));

  const salesByCategoryMap = new Map<string, number>();

  for (const order of completedOrders) {
    for (const item of order.items) {
      const product = products.find((product) => product.id === item.productId);

      if (!product) continue;

      const currentRevenue = salesByCategoryMap.get(product.category) ?? 0;

      salesByCategoryMap.set(
        product.category,
        currentRevenue + item.price * item.quantity,
      );
    }
  }

  const salesByCategory = Array.from(salesByCategoryMap.entries())
    .map(([category, revenue]) => ({
      category,
      revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const productPerformance = products
    .map((product) => ({
      id: product.id,
      name: product.name,
      orders: product.orders,
      revenue: product.revenue,
      stock: product.stock,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  return {
    totalRevenue,
    totalOrders,
    totalCustomers,
    lowStockCount,
    revenueByMonth,
    salesByCategory,
    productPerformance,
  };
}
