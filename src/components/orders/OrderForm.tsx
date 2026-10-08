import { useMemo, useState } from "react";

import type { Customer, OrderItem, Product } from "../../types/database";

import { createOrder } from "../../services/orderService";
import { toast } from "sonner";

type OrderFormProps = {
  workspaceId: string;
  customers: Customer[];
  products: Product[];
  onSuccess: () => void;
  onCancel: () => void;
};

type OrderLine = {
  productId: string;
  quantity: number;
};

function OrderForm({
  workspaceId,
  customers,
  products,
  onSuccess,
  onCancel,
}: OrderFormProps) {
  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [items, setItems] = useState<OrderLine[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const availableProducts = useMemo(() => {
    const selectedProductIds = new Set(items.map((item) => item.productId));

    return products.filter((product) => !selectedProductIds.has(product.id));
  }, [products, items]);

  const orderItems: OrderItem[] = useMemo(() => {
    return items
      .map((item) => {
        const product = products.find(
          (product) => product.id === item.productId,
        );

        if (!product) {
          return null;
        }

        return {
          productId: product.id,
          name: product.name,
          quantity: item.quantity,
          price: product.price,
        };
      })
      .filter((item): item is OrderItem => item !== null);
  }, [items, products]);

  const total = useMemo(() => {
    return orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
  }, [orderItems]);

  function handleAddItem() {
    setError("");

    if (!productId) {
      setError("Please select a product.");
      return;
    }

    if (!Number.isFinite(quantity) || quantity < 1) {
      setError("Quantity must be at least 1.");
      return;
    }

    setItems((currentItems) => [
      ...currentItems,
      {
        productId,
        quantity,
      },
    ]);

    setProductId("");
    setQuantity(1);
  }

  function handleRemoveItem(productId: string) {
    setItems((currentItems) =>
      currentItems.filter((item) => item.productId !== productId),
    );
  }

  async function handleSubmit() {
    setError("");

    if (!customerId) {
      setError("Please select a customer.");
      return;
    }

    if (orderItems.length === 0) {
      setError("Please add at least one product.");
      return;
    }

    try {
      setIsSubmitting(true);

      await createOrder({
        workspaceId,
        customerId,
        items: orderItems,
        total,
        status: "pending",
      });

      onSuccess();
    } catch (error) {
      console.error("Failed to create order:", error);

      toast.error("Unable to create order", {
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Customer */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Customer</label>

        <select
          value={customerId}
          onChange={(event) => setCustomerId(event.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-ring focus:ring-4 focus:ring-ring/20"
        >
          <option value="" className="bg-popover text-popover-foreground">
            Select customer
          </option>

          {customers.map((customer) => (
            <option
              key={customer.id}
              value={customer.id}
              className="bg-popover text-popover-foreground"
            >
              {customer.name}
            </option>
          ))}
        </select>
      </div>

      {/* Add product */}
      <div className="rounded-xl border border-border bg-muted/50 p-4">
        <div className="grid gap-4 sm:grid-cols-[1fr_120px_auto] sm:items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Product</label>

            <select
              value={productId}
              onChange={(event) => setProductId(event.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-ring focus:ring-4 focus:ring-ring/20"
            >
              <option value="" className="bg-popover text-popover-foreground">
                Select product
              </option>

              {availableProducts.map((product) => (
                <option
                  key={product.id}
                  value={product.id}
                  className="bg-popover text-popover-foreground"
                >
                  {product.name} - ${product.price}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Quantity</label>

            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-ring focus:ring-4 focus:ring-ring/20"
            />
          </div>

          <button
            type="button"
            onClick={handleAddItem}
            disabled={availableProducts.length === 0}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Add Product
          </button>
        </div>
      </div>

      {/* Order items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">Order Items</h2>

          <span className="text-xs text-muted-foreground">
            {orderItems.length} {orderItems.length === 1 ? "item" : "items"}
          </span>
        </div>

        {orderItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">No products added yet.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            {orderItems.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between border-b border-border px-4 py-3 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{item.name}</p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    ${item.price} × {item.quantity}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-foreground">
                    ${(item.price * item.quantity).toLocaleString()}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.productId)}
                    className="text-xs text-red-400 transition hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-muted/50 px-4 py-4">
        <span className="text-sm text-muted-foreground">Order Total</span>

        <span className="text-xl font-semibold text-foreground">
          ${total.toLocaleString()}
        </span>
      </div>

      {/* Error */}
      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || orderItems.length === 0}
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSubmitting ? "Creating..." : "Create Order"}
        </button>
      </div>
    </div>
  );
}

export default OrderForm;
