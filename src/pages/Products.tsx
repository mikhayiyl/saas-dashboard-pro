import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { deleteProduct, subscribeToProducts } from "../services/productService";
import { getUserProfile } from "../services/userService";
import ProductForm from "../components/products/ProductForm";

import type { Product } from "../types/database";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";

const LOW_STOCK_THRESHOLD = 10;

function getStockStatus(stock: number) {
  if (stock === 0) {
    return {
      label: "Out of stock",
      className: "text-red-400",
    };
  }

  if (stock <= LOW_STOCK_THRESHOLD) {
    return {
      label: "Low stock",
      className: "text-amber-400",
    };
  }

  return {
    label: "In stock",
    className: "text-emerald-400",
  };
}

function Products() {
  const { user } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(
    null,
  );
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

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

  const categories = Array.from(
    new Set(products.map((product) => product.category)),
  ).sort();

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  async function handleDeleteProduct() {
    if (!workspaceId || !productToDelete) {
      return;
    }

    try {
      setDeletingProductId(productToDelete.id);

      await deleteProduct(workspaceId, productToDelete.id);

      setProductToDelete(null);
    } catch (error) {
      console.error("Failed to delete product:", error);
    } finally {
      setDeletingProductId(null);
    }
  }

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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-lg border border-white/10 bg-[#0C0D0F] px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/20"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-[#0C0D0F] px-4 py-2.5 text-sm text-white outline-none transition focus:border-white/20 sm:w-48"
        >
          <option value="all">All Categories</option>

          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

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
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product.stock);

                return (
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
                      <div className="flex flex-col">
                        <span className="text-white/80">{product.stock}</span>

                        <span className={`text-xs ${stockStatus.className}`}>
                          {stockStatus.label}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-white/70">
                      {product.orders.toLocaleString()}
                    </td>

                    <td className="px-6 py-4 font-medium">
                      ${product.revenue.toLocaleString()}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-4">
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

                        <button
                          type="button"
                          onClick={() => setProductToDelete(product)}
                          disabled={deletingProductId === product.id}
                          className="text-sm font-medium text-red-400 transition hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingProductId === product.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <ConfirmDeleteModal
        open={Boolean(productToDelete)}
        itemName={productToDelete?.name ?? ""}
        itemType="product"
        isDeleting={deletingProductId !== null}
        onConfirm={handleDeleteProduct}
        onCancel={() => setProductToDelete(null)}
      />
    </div>
  );
}

export default Products;
