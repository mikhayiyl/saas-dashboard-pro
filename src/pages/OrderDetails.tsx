import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { useAuth } from "../hooks/useAuth";
import { getUserProfile } from "../services/userService";
import { subscribeToOrders } from "../services/orderService";
import { subscribeToCustomers } from "../services/customerService";
import type { Customer, Order } from "../types/database";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const statusStyles: Record<Order["status"], string> = {
  pending: "bg-amber-500/10 text-amber-400",
  processing: "bg-blue-500/10 text-blue-400",
  completed: "bg-emerald-500/10 text-emerald-400",
  cancelled: "bg-red-500/10 text-red-400",
};

function OrderDetails() {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const uid = user.uid;
    let isCurrent = true;
    let unsubscribeOrders: (() => void) | undefined;
    let unsubscribeCustomers: (() => void) | undefined;

    async function load() {
      try {
        const profile = await getUserProfile(uid);

        if (!profile || !isCurrent) {
          setLoading(false);
          return;
        }

        unsubscribeOrders = subscribeToOrders(profile.workspaceId, (data) => {
          setOrders(data);
          setLoading(false);
        });

        unsubscribeCustomers = subscribeToCustomers(
          profile.workspaceId,
          setCustomers,
        );
      } catch (error) {
        console.error("Failed to load order:", error);
        setLoading(false);
      }
    }

    load();

    return () => {
      isCurrent = false;
      unsubscribeOrders?.();
      unsubscribeCustomers?.();
    };
  }, [user]);

  const order = orders.find((item) => item.id === orderId);
  const customer = customers.find((item) => item.id === order?.customerId);

  const backLink = (
    <Link
      to="/orders"
      className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
    >
      <ArrowLeft className="size-4" />
      Back to orders
    </Link>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        {backLink}
        <p className="text-sm text-muted-foreground">Loading order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        {backLink}
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Order not found. It may have been deleted.
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalUnits = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-6">
      {backLink}

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Order #{order.id.slice(-6)}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        <span
          className={`w-fit rounded-full px-3 py-1 text-xs font-medium capitalize ${statusStyles[order.status]}`}
        >
          {order.status}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Items ordered</CardTitle>

            <CardDescription>
              {totalUnits} {totalUnits === 1 ? "unit" : "units"} across{" "}
              {order.items.length}{" "}
              {order.items.length === 1 ? "product" : "products"}
            </CardDescription>
          </CardHeader>

          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-3 font-medium">Product</th>
                  <th className="py-3 text-right font-medium">Price</th>
                  <th className="py-3 text-right font-medium">Qty</th>
                  <th className="py-3 text-right font-medium">Subtotal</th>
                </tr>
              </thead>

              <tbody>
                {order.items.map((item) => (
                  <tr
                    key={item.productId}
                    className="border-b border-border last:border-0"
                  >
                    <td className="py-3 font-medium">{item.name}</td>
                    <td className="py-3 text-right">
                      ${item.price.toLocaleString()}
                    </td>
                    <td className="py-3 text-right">{item.quantity}</td>
                    <td className="py-3 text-right font-medium">
                      ${(item.price * item.quantity).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr>
                  <td colSpan={3} className="pt-4 text-right font-medium">
                    Total
                  </td>
                  <td className="pt-4 text-right text-base font-semibold">
                    ${order.total.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">
            {customer ? (
              <>
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p className="font-medium">{customer.name}</p>
                </div>

                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium break-all">{customer.email}</p>
                </div>

                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{customer.phone}</p>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Unknown customer</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default OrderDetails;
