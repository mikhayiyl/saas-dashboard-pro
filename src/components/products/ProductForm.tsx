import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { productSchema } from "../../schemas/productSchema";
import { createProduct, updateProduct } from "../../services/productService";

import type { Product } from "../../types/database";

type ProductFormProps = {
  workspaceId: string;
  product?: Product;
  onSuccess: () => void;
  onCancel: () => void;
};

function ProductForm({
  workspaceId,
  product,
  onSuccess,
  onCancel,
}: ProductFormProps) {
  const [submitError, setSubmitError] = useState("");

  const isEditMode = Boolean(product);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<
    z.input<typeof productSchema>,
    unknown,
    z.output<typeof productSchema>
  >({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      category: product?.category ?? "",
      price: product?.price ?? 0,
      stock: product?.stock ?? 0,
    },
  });

  useEffect(() => {
    if (!product) {
      reset({
        name: "",
        category: "",
        price: 0,
        stock: 0,
      });

      return;
    }

    reset({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
    });
  }, [product, reset]);

  async function onSubmit(data: z.output<typeof productSchema>) {
    try {
      setSubmitError("");

      if (product) {
        await updateProduct(workspaceId, product.id, {
          name: data.name,
          category: data.category,
          price: data.price,
          stock: data.stock,
        });
      } else {
        await createProduct({
          workspaceId,
          name: data.name,
          category: data.category,
          price: data.price,
          stock: data.stock,
          orders: 0,
          revenue: 0,
        });
      }

      reset();
      onSuccess();
    } catch (error) {
      console.error(
        `Failed to ${isEditMode ? "update" : "create"} product:`,
        error,
      );

      setSubmitError(
        `Failed to ${isEditMode ? "update" : "create"} product. Please try again.`,
      );
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#0C0D0F] p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">
          {isEditMode ? "Edit Product" : "Add Product"}
        </h2>

        <p className="mt-1 text-sm text-white/50">
          {isEditMode
            ? "Update the product information below."
            : "Add a new product to your inventory."}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-white/80">
              Product Name
            </label>

            <input
              id="name"
              type="text"
              placeholder="e.g. Wireless Mouse"
              {...register("name")}
              className="w-full rounded-lg border border-white/10 bg-white/3 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/20 focus:bg-white/5"
            />

            {errors.name && (
              <p className="text-xs text-red-400">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="category"
              className="text-sm font-medium text-white/80"
            >
              Category
            </label>

            <input
              id="category"
              type="text"
              placeholder="e.g. Accessories"
              {...register("category")}
              className="w-full rounded-lg border border-white/10 bg-white/3 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/20 focus:bg-white/5"
            />

            {errors.category && (
              <p className="text-xs text-red-400">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="price"
              className="text-sm font-medium text-white/80"
            >
              Price
            </label>

            <input
              id="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              {...register("price")}
              className="w-full rounded-lg border border-white/10 bg-white/3 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/20 focus:bg-white/5"
            />

            {errors.price && (
              <p className="text-xs text-red-400">{errors.price.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="stock"
              className="text-sm font-medium text-white/80"
            >
              Stock
            </label>

            <input
              id="stock"
              type="number"
              min="0"
              step="1"
              placeholder="0"
              {...register("stock")}
              className="w-full rounded-lg border border-white/10 bg-white/3 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/20 focus:bg-white/5"
            />

            {errors.stock && (
              <p className="text-xs text-red-400">{errors.stock.message}</p>
            )}
          </div>
        </div>

        {submitError && (
          <p className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-sm text-red-400">
            {submitError}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? isEditMode
                ? "Saving..."
                : "Adding..."
              : isEditMode
                ? "Save Changes"
                : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductForm;
