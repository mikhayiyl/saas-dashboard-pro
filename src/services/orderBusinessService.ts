import { push, ref, runTransaction } from "firebase/database";

import { db } from "../lib/Firebase";
import type { Activity, Notification, Order } from "../types/database";

type WorkspaceData = {
  products?: Record<string, any>;
  customers?: Record<string, any>;
  orders?: Record<string, Order>;
  activities?: Record<string, Activity>;
  notifications?: Record<string, Notification>;
};

function createActivity(workspaceId: string, message: string): Activity {
  const id = push(ref(db, "activities")).key;

  if (!id) {
    throw new Error("Unable to create activity.");
  }

  return {
    id,
    workspaceId,
    type: "order",
    message,
    timestamp: Date.now(),
  };
}

function createNotification(
  workspaceId: string,
  message: string,
  type: Notification["type"],
): Notification {
  const id = push(ref(db, "notifications")).key;

  if (!id) {
    throw new Error("Unable to create notification.");
  }

  return {
    id,
    workspaceId,
    title: "Order updated",
    message,
    type,
    read: false,
    timestamp: Date.now(),
  };
}

function applyInventory(products: Record<string, any>, order: Order) {
  const updatedProducts = { ...products };

  // Check everything before changing any product.
  for (const item of order.items) {
    const product = updatedProducts[item.productId];

    if (!product) {
      throw new Error(`Product "${item.name}" no longer exists.`);
    }

    if (product.stock < item.quantity) {
      throw new Error(
        `Not enough stock for "${item.name}". Required: ${item.quantity}, available: ${product.stock}.`,
      );
    }
  }

  // Apply the inventory changes only after all checks pass.
  for (const item of order.items) {
    const product = updatedProducts[item.productId];

    updatedProducts[item.productId] = {
      ...product,
      stock: product.stock - item.quantity,
      orders: (product.orders ?? 0) + item.quantity,
      revenue: (product.revenue ?? 0) + item.price * item.quantity,
    };
  }

  return updatedProducts;
}

function reverseInventory(products: Record<string, any>, order: Order) {
  const updatedProducts = { ...products };

  for (const item of order.items) {
    const product = updatedProducts[item.productId];

    if (!product) {
      throw new Error(`Product "${item.name}" no longer exists.`);
    }

    updatedProducts[item.productId] = {
      ...product,
      stock: product.stock + item.quantity,
      orders: Math.max(0, (product.orders ?? 0) - item.quantity),
      revenue: Math.max(0, (product.revenue ?? 0) - item.price * item.quantity),
    };
  }

  return updatedProducts;
}

export async function transitionOrderStatus(
  workspaceId: string,
  orderId: string,
  newStatus: Order["status"],
): Promise<void> {
  const workspaceRef = ref(db, `workspaces/${workspaceId}`);

  const result = await runTransaction(workspaceRef, (workspace) => {
    if (!workspace) {
      throw new Error("Workspace not found.");
    }

    const data = workspace as WorkspaceData;

    const products = data.products ?? {};
    const customers = data.customers ?? {};
    const orders = data.orders ?? {};

    const order = orders[orderId];

    if (!order) {
      throw new Error("Order not found.");
    }

    const previousStatus = order.status;

    if (previousStatus === newStatus) {
      return workspace;
    }

    const customer = customers[order.customerId];

    if (!customer) {
      throw new Error("Customer not found.");
    }

    const wasCompleted = previousStatus === "completed";

    const willBeCompleted = newStatus === "completed";

    let updatedProducts = products;
    let updatedCustomer = { ...customer };

    if (!wasCompleted && willBeCompleted) {
      updatedProducts = applyInventory(products, order);

      updatedCustomer = {
        ...updatedCustomer,
        totalOrders: (customer.totalOrders ?? 0) + 1,
        totalSpent: (customer.totalSpent ?? 0) + order.total,
      };
    }

    if (wasCompleted && !willBeCompleted) {
      updatedProducts = reverseInventory(products, order);

      updatedCustomer = {
        ...updatedCustomer,
        totalOrders: Math.max(0, (customer.totalOrders ?? 0) - 1),
        totalSpent: Math.max(0, (customer.totalSpent ?? 0) - order.total),
      };
    }

    const message = `Order status changed from ${previousStatus} to ${newStatus}.`;

    const activity = createActivity(workspaceId, message);

    const notification = createNotification(
      workspaceId,
      message,
      newStatus === "completed"
        ? "success"
        : newStatus === "cancelled"
          ? "warning"
          : "info",
    );

    return {
      ...workspace,

      products: updatedProducts,

      customers: {
        ...customers,
        [order.customerId]: updatedCustomer,
      },

      orders: {
        ...orders,
        [orderId]: {
          ...order,
          status: newStatus,
        },
      },

      activities: {
        ...(data.activities ?? {}),
        [activity.id]: activity,
      },

      notifications: {
        ...(data.notifications ?? {}),
        [notification.id]: notification,
      },
    };
  });

  if (!result.committed) {
    throw new Error("Unable to update the order.");
  }
}

export async function deleteOrderWithBusinessLogic(
  workspaceId: string,
  order: Order,
): Promise<void> {
  const workspaceRef = ref(db, `workspaces/${workspaceId}`);

  const result = await runTransaction(workspaceRef, (workspace) => {
    if (!workspace) {
      throw new Error("Workspace not found.");
    }

    const data = workspace as WorkspaceData;

    const products = data.products ?? {};
    const customers = data.customers ?? {};
    const orders = data.orders ?? {};

    const currentOrder = orders[order.id];

    if (!currentOrder) {
      throw new Error("Order no longer exists.");
    }

    let updatedProducts = products;
    let updatedCustomer = customers[currentOrder.customerId];

    if (currentOrder.status === "completed") {
      if (!updatedCustomer) {
        throw new Error("Customer not found.");
      }

      updatedProducts = reverseInventory(products, currentOrder);

      updatedCustomer = {
        ...updatedCustomer,
        totalOrders: Math.max(0, (updatedCustomer.totalOrders ?? 0) - 1),
        totalSpent: Math.max(
          0,
          (updatedCustomer.totalSpent ?? 0) - currentOrder.total,
        ),
      };
    }

    const updatedOrders = { ...orders };

    delete updatedOrders[order.id];

    return {
      ...workspace,

      products: updatedProducts,

      customers: updatedCustomer
        ? {
            ...customers,
            [currentOrder.customerId]: updatedCustomer,
          }
        : customers,

      orders: updatedOrders,
    };
  });

  if (!result.committed) {
    throw new Error("Unable to delete the order.");
  }
}
