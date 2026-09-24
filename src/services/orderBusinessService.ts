import { get, increment, ref, update } from "firebase/database";
import { createActivity } from "./activityService";
import { db } from "../lib/Firebase";
import type { Order } from "../types/database";
import { createNotification } from "./notificationService";

function buildCompletedOrderUpdates(
  workspaceId: string,
  order: Order,
  direction: "apply" | "reverse",
): Record<string, unknown> {
  const multiplier = direction === "apply" ? 1 : -1;

  const updates: Record<string, unknown> = {};

  updates[
    `workspaces/${workspaceId}/customers/${order.customerId}/totalOrders`
  ] = increment(multiplier);

  updates[
    `workspaces/${workspaceId}/customers/${order.customerId}/totalSpent`
  ] = increment(order.total * multiplier);

  for (const item of order.items) {
    updates[`workspaces/${workspaceId}/products/${item.productId}/stock`] =
      increment(-item.quantity * multiplier);

    updates[`workspaces/${workspaceId}/products/${item.productId}/orders`] =
      increment(item.quantity * multiplier);

    updates[`workspaces/${workspaceId}/products/${item.productId}/revenue`] =
      increment(item.price * item.quantity * multiplier);
  }

  return updates;
}

async function validateCompletedOrder(
  workspaceId: string,
  order: Order,
  direction: "apply" | "reverse",
) {
  const customerRef = ref(
    db,
    `workspaces/${workspaceId}/customers/${order.customerId}`,
  );

  const customerSnapshot = await get(customerRef);

  if (!customerSnapshot.exists()) {
    throw new Error("Customer not found.");
  }

  for (const item of order.items) {
    const productRef = ref(
      db,
      `workspaces/${workspaceId}/products/${item.productId}`,
    );

    const productSnapshot = await get(productRef);

    if (!productSnapshot.exists()) {
      throw new Error(`Product "${item.name}" no longer exists.`);
    }

    if (direction === "apply") {
      const product = productSnapshot.val();

      if (product.stock < item.quantity) {
        throw new Error(`Not enough stock for "${item.name}".`);
      }
    }
  }
}

export async function completeOrder(
  workspaceId: string,
  order: Order,
): Promise<void> {
  await validateCompletedOrder(workspaceId, order, "apply");

  const updates = buildCompletedOrderUpdates(workspaceId, order, "apply");

  await update(ref(db), updates);
}

export async function reverseCompletedOrder(
  workspaceId: string,
  order: Order,
): Promise<void> {
  await validateCompletedOrder(workspaceId, order, "reverse");

  const updates = buildCompletedOrderUpdates(workspaceId, order, "reverse");

  await update(ref(db), updates);
}

export async function transitionOrderStatus(
  workspaceId: string,
  orderId: string,
  newStatus: Order["status"],
): Promise<void> {
  const orderRef = ref(db, `workspaces/${workspaceId}/orders/${orderId}`);

  const snapshot = await get(orderRef);

  if (!snapshot.exists()) {
    throw new Error("Order not found.");
  }

  const order = {
    ...(snapshot.val() as Order),
    id: snapshot.key ?? orderId,
  };

  const previousStatus = order.status;

  if (previousStatus === newStatus) {
    return;
  }

  const wasCompleted = previousStatus === "completed";
  const willBeCompleted = newStatus === "completed";

  const updates: Record<string, unknown> = {
    [`workspaces/${workspaceId}/orders/${orderId}/status`]: newStatus,
  };

  if (!wasCompleted && willBeCompleted) {
    await validateCompletedOrder(workspaceId, order, "apply");

    Object.assign(
      updates,
      buildCompletedOrderUpdates(workspaceId, order, "apply"),
    );
  }

  if (wasCompleted && !willBeCompleted) {
    await validateCompletedOrder(workspaceId, order, "reverse");

    Object.assign(
      updates,
      buildCompletedOrderUpdates(workspaceId, order, "reverse"),
    );
  }

  await update(ref(db), updates);

  await createActivity({
    workspaceId,
    type: "order",
    message: `Order status changed from ${previousStatus} to ${newStatus}.`,
  });

  await createNotification({
    workspaceId,
    title: "Order updated",
    message: `Order status changed from ${previousStatus} to ${newStatus}.`,
    type:
      newStatus === "completed"
        ? "success"
        : newStatus === "cancelled"
          ? "warning"
          : "info",
    read: false,
  });
}

export async function deleteOrderWithBusinessLogic(
  workspaceId: string,
  order: Order,
): Promise<void> {
  const updates: Record<string, unknown> = {
    [`workspaces/${workspaceId}/orders/${order.id}`]: null,
  };

  if (order.status === "completed") {
    await validateCompletedOrder(workspaceId, order, "reverse");

    Object.assign(
      updates,
      buildCompletedOrderUpdates(workspaceId, order, "reverse"),
    );
  }

  await update(ref(db), updates);
}
