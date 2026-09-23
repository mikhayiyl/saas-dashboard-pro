import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { subscribeToProducts } from "../services/productService";
import { getUserProfile } from "../services/userService";
import ProductForm from "../components/products/ProductForm";

import type { Product } from "../types/database";

function Products() {
  const { user } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    const uid = user.uid;

    let unsubscribe: (() => void) | undefined;

    async function loadProducts() {
      try {
        const profile = await getUserProfile(uid);

        if (!profile) {
          throw new Error("User profile not found.");
        }

        setWorkspaceId(profile.workspaceId);

        unsubscribe = subscribeToProducts(profile.workspaceId, (data) => {
          setProducts(data);
          setLoading(false);
        });
      } catch (error) {
        console.error("Failed to load products:", error);
        setLoading(false);
      }
    }

    loadProducts();

    return () => {
      unsubscribe?.();
    };
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="mt-1 text-sm text-white/50">
            Manage your products and inventory.
          </p>
        </div>

        <p className="text-sm text-white/50">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="mt-1 text-sm text-white/50">
            Manage your products and inventory.
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            onClick={() => {
              setEditingProduct(null);
              setShowForm(true);
            }}
            className="rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-white/90"
          >
            Add Product
          </button>
        )}
      </div>

      {showForm && workspaceId && (
        <ProductForm
          workspaceId={workspaceId}
          product={editingProduct ?? undefined}
          onSuccess={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
        />
      )}

      {/* table  */}

      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0C0D0F]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-white/10">
              <tr className="text-xs uppercase tracking-wider text-white/40">
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium">Orders</th>
                <th className="px-6 py-4 font-medium">Revenue</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="text-sm transition hover:bg-white/2"
                >
                  <td className="px-6 py-4 font-medium">{product.name}</td>

                  <td className="px-6 py-4 text-white/60">
                    {product.category}
                  </td>

                  <td className="px-6 py-4">
                    ${product.price.toLocaleString()}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={
                        product.stock < 30 ? "text-amber-400" : "text-white/70"
                      }
                    >
                      {product.stock}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-white/70">
                    {product.orders.toLocaleString()}
                  </td>

                  <td className="px-6 py-4 font-medium">
                    ${product.revenue.toLocaleString()}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProduct(product);
                        setShowForm(true);
                      }}
                      className="text-sm font-medium text-white/60 transition hover:text-white"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Products;
