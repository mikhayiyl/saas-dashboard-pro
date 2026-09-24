import {
  onValue,
  push,
  ref,
  remove,
  set,
  update,
  get,
} from "firebase/database";

import { db } from "../lib/Firebase";
import type { Order } from "../types/database";

type CreateOrderData = Omit<Order, "id" | "createdAt">;

type UpdateOrderData = Partial<
  Pick<Order, "customerId" | "items" | "total" | "status">
>;

export async function createOrder(data: CreateOrderData): Promise<string> {
  const ordersRef = ref(db, `workspaces/${data.workspaceId}/orders`);

  const orderRef = push(ordersRef);

  if (!orderRef.key) {
    throw new Error("Unable to generate order ID.");
  }

  const order: Order = {
    ...data,
    id: orderRef.key,
    createdAt: Date.now(),
  };

  await set(orderRef, order);

  return orderRef.key;
}

export async function getOrder(
  workspaceId: string,
  orderId: string,
): Promise<Order | null> {
  const orderRef = ref(db, `workspaces/${workspaceId}/orders/${orderId}`);

  const snapshot = await get(orderRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    ...(snapshot.val() as Order),
    id: snapshot.key ?? orderId,
  };
}

export async function updateOrder(
  workspaceId: string,
  orderId: string,
  data: UpdateOrderData,
): Promise<void> {
  const orderRef = ref(db, `workspaces/${workspaceId}/orders/${orderId}`);

  await update(orderRef, data);
}

export async function deleteOrder(
  workspaceId: string,
  orderId: string,
): Promise<void> {
  const orderRef = ref(db, `workspaces/${workspaceId}/orders/${orderId}`);

  await remove(orderRef);
}

export function subscribeToOrders(
  workspaceId: string,
  callback: (orders: Order[]) => void,
) {
  const ordersRef = ref(db, `workspaces/${workspaceId}/orders`);

  return onValue(ordersRef, (snapshot) => {
    const orders: Order[] = [];

    snapshot.forEach((childSnapshot) => {
      const order = childSnapshot.val() as Order;

      orders.push({
        ...order,
        id: childSnapshot.key ?? order.id,
      });
    });

    callback(orders);
  });
}
