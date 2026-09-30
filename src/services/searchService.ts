import { get, ref } from "firebase/database";

import { db } from "@/lib/Firebase";
import type { Customer, Order, Product } from "@/types/database";

export type WorkspaceSearchResult = {
  id: string;
  type: "Customer" | "Product" | "Order";
  label: string;
  detail: string;
  path: "/customers" | "/products" | "/orders";
};

export async function searchWorkspaceRecords(
  workspaceId: string,
  searchTerm: string,
): Promise<WorkspaceSearchResult[]> {
  const term = searchTerm.trim().toLowerCase();
  if (!term) return [];

  const [customersSnapshot, productsSnapshot, ordersSnapshot] =
    await Promise.all([
      get(ref(db, `workspaces/${workspaceId}/customers`)),
      get(ref(db, `workspaces/${workspaceId}/products`)),
      get(ref(db, `workspaces/${workspaceId}/orders`)),
    ]);

  const customers: Customer[] = [];
  customersSnapshot.forEach((child) => {
    const customer = child.val() as Customer;
    customers.push({ ...customer, id: child.key ?? customer.id });
  });

  const products: Product[] = [];
  productsSnapshot.forEach((child) => {
    const product = child.val() as Product;
    products.push({ ...product, id: child.key ?? product.id });
  });

  const orders: Order[] = [];
  ordersSnapshot.forEach((child) => {
    const order = child.val() as Order;
    orders.push({ ...order, id: child.key ?? order.id });
  });

  const customerById = new Map(
    customers.map((customer) => [customer.id, customer]),
  );
  const customerMatches: WorkspaceSearchResult[] = [];
  const productMatches: WorkspaceSearchResult[] = [];
  const orderMatches: WorkspaceSearchResult[] = [];

  customers.forEach((customer) => {
    if (
      `${customer.name} ${customer.email} ${customer.phone}`
        .toLowerCase()
        .includes(term)
    ) {
      customerMatches.push({
        id: customer.id,
        type: "Customer",
        label: customer.name,
        detail: customer.email,
        path: "/customers",
      });
    }
  });

  products.forEach((product) => {
    if (`${product.name} ${product.category}`.toLowerCase().includes(term)) {
      productMatches.push({
        id: product.id,
        type: "Product",
        label: product.name,
        detail: product.category,
        path: "/products",
      });
    }
  });

  orders.forEach((order) => {
    const customer = customerById.get(order.customerId);
    const searchContent = [
      order.id,
      order.status,
      customer?.name,
      customer?.email,
      ...order.items.map((item) => item.name),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (searchContent.includes(term)) {
      orderMatches.push({
        id: order.id,
        type: "Order",
        label: `Order #${order.id.slice(-6)}`,
        detail: `${customer?.name ?? "Unknown customer"} · ${order.status}`,
        path: "/orders",
      });
    }
  });

  return [
    ...customerMatches.slice(0, 3),
    ...productMatches.slice(0, 3),
    ...orderMatches.slice(0, 3),
  ];
}
