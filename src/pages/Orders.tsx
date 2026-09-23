import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

import { useAuth } from "../context/AuthContext";
import { getUserProfile } from "../services/userService";
import {
  deleteOrder,
  subscribeToOrders,
  updateOrder,
} from "../services/orderService";
import { subscribeToCustomers } from "../services/customerService";
import { subscribeToProducts } from "../services/productService";

import type { Customer, Order, Product } from "../types/database";
import OrderForm from "@/components/orders/OrderForm";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";

function Orders() {
  const { user } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [workspaceId, setWorkspaceId] = useState("");
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;

    const uid = user.uid;

    let unsubscribeOrders: (() => void) | undefined;
    let unsubscribeCustomers: (() => void) | undefined;
    let unsubscribeProducts: (() => void) | undefined;
    async function loadOrders() {
      try {
        const profile = await getUserProfile(uid);

        if (!profile) {
          throw new Error("User profile not found.");
        }

        setWorkspaceId(profile.workspaceId);

        unsubscribeOrders = subscribeToOrders(profile.workspaceId, (data) => {
          setOrders(data);
          setLoading(false);
        });

        unsubscribeCustomers = subscribeToCustomers(
          profile.workspaceId,
          (data) => {
            setCustomers(data);
          },
        );

        unsubscribeProducts = subscribeToProducts(
          profile.workspaceId,
          (data) => {
            setProducts(data);
          },
        );
      } catch (error) {
        console.error("Failed to load orders:", error);
        setLoading(false);
      }
    }

    loadOrders();

    return () => {
      unsubscribeOrders?.();
      unsubscribeCustomers?.();
      unsubscribeProducts?.();
    };
  }, [user]);

  const customerMap = new Map(
    customers.map((customer) => [customer.id, customer.name]),
  );

  async function handleStatusChange(orderId: string, status: Order["status"]) {
    if (!workspaceId) return;

    try {
      await updateOrder(workspaceId, orderId, {
        status,
      });
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  }

  async function handleDeleteOrder() {
    if (!orderToDelete || !workspaceId) return;

    try {
      setIsDeleting(true);

      await deleteOrder(workspaceId, orderToDelete.id);

      setOrderToDelete(null);
    } catch (error) {
      console.error("Failed to delete order:", error);
    } finally {
      setIsDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-white/50">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Orders</h1>

          <p className="mt-1 text-sm text-white/50">
            Manage and monitor customer orders.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-white/90"
        >
          Create Order
        </button>
      </div>
      {/* Orders table */}
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0C0D0F]">
        <table className="w-full min-w-225 text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-white/50">
              <th className="px-6 py-4 font-medium">Order</th>

              <th className="px-6 py-4 font-medium">Customer</th>

              <th className="px-6 py-4 font-medium">Items</th>

              <th className="px-6 py-4 font-medium">Total</th>

              <th className="px-6 py-4 font-medium">Status</th>

              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-white/5 last:border-0"
              >
                <td className="px-6 py-4 font-medium text-white">
                  #{order.id.slice(-6)}
                </td>

                <td className="px-6 py-4 text-white/70">
                  {customerMap.get(order.customerId) ?? "Unknown customer"}
                </td>

                <td className="px-6 py-4 text-white/70">
                  {order.items.reduce(
                    (total, item) => total + item.quantity,
                    0,
                  )}
                </td>

                <td className="px-6 py-4 font-medium text-white">
                  ${order.total.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <select
                    value={order.status}
                    onChange={(event) =>
                      handleStatusChange(
                        order.id,
                        event.target.value as Order["status"],
                      )
                    }
                    className={`rounded-full border-0 px-2.5 py-1 text-xs font-medium outline-none ${
                      order.status === "completed"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : order.status === "processing"
                          ? "bg-blue-500/10 text-blue-400"
                          : order.status === "pending"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    <option
                      value="pending"
                      className="bg-[#0C0D0F] text-amber-400"
                    >
                      Pending
                    </option>

                    <option
                      value="processing"
                      className="bg-[#0C0D0F] text-blue-400"
                    >
                      Processing
                    </option>

                    <option
                      value="completed"
                      className="bg-[#0C0D0F] text-emerald-400"
                    >
                      Completed
                    </option>

                    <option
                      value="cancelled"
                      className="bg-[#0C0D0F] text-red-400"
                    >
                      Cancelled
                    </option>
                  </select>
                </td>

                <td className="px-6 py-4 text-white/50">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <button
                    type="button"
                    onClick={() => setOrderToDelete(order)}
                    className="text-xs font-medium text-red-400 transition hover:text-red-300"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Create Order Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="border-white/10 bg-[#0C0D0F] text-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Create Order</DialogTitle>
          </DialogHeader>

          <OrderForm
            workspaceId={workspaceId}
            customers={customers}
            products={products}
            onSuccess={() => setIsCreateOpen(false)}
            onCancel={() => setIsCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation */}
      <ConfirmDeleteModal
        open={Boolean(orderToDelete)}
        itemName={
          orderToDelete
            ? `${customerMap.get(orderToDelete.customerId) ?? "Unknown customer"} • $${orderToDelete.total.toLocaleString()}`
            : ""
        }
        itemType="order"
        isDeleting={isDeleting}
        onConfirm={handleDeleteOrder}
        onCancel={() => {
          if (!isDeleting) {
            setOrderToDelete(null);
          }
        }}
      />
    </div>
  );
}

export default Orders;
