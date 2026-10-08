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
    <div className="rounded-xl border border-[#e5eaf1] bg-white p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">
          {isEditMode ? "Edit Product" : "Add Product"}
        </h2>

        <p className="mt-1 text-sm text-[#738096]">
          {isEditMode
            ? "Update the product information below."
            : "Add a new product to your inventory."}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-[#34435a]">
              Product Name
            </label>

            <input
              id="name"
              type="text"
              placeholder="e.g. Wireless Mouse"
              {...register("name")}
              className="w-full rounded-lg border border-[#dfe5ee] bg-[#f8fafd] px-3 py-2.5 text-sm text-[#142238] outline-none transition placeholder:text-[#a0aabc] focus:border-[#5476e8] focus:bg-white focus:ring-4 focus:ring-[#5476e8]/[0.08]"
            />

            {errors.name && (
              <p className="text-xs text-[#c34452]">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="category"
              className="text-sm font-medium text-[#34435a]"
            >
              Category
            </label>

            <input
              id="category"
              type="text"
              placeholder="e.g. Accessories"
              {...register("category")}
              className="w-full rounded-lg border border-[#dfe5ee] bg-[#f8fafd] px-3 py-2.5 text-sm text-[#142238] outline-none transition placeholder:text-[#a0aabc] focus:border-[#5476e8] focus:bg-white focus:ring-4 focus:ring-[#5476e8]/[0.08]"
            />

            {errors.category && (
              <p className="text-xs text-[#c34452]">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="price"
              className="text-sm font-medium text-[#34435a]"
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
              className="w-full rounded-lg border border-[#dfe5ee] bg-[#f8fafd] px-3 py-2.5 text-sm text-[#142238] outline-none transition placeholder:text-[#a0aabc] focus:border-[#5476e8] focus:bg-white focus:ring-4 focus:ring-[#5476e8]/[0.08]"
            />

            {errors.price && (
              <p className="text-xs text-[#c34452]">{errors.price.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="stock"
              className="text-sm font-medium text-[#34435a]"
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
              className="w-full rounded-lg border border-[#dfe5ee] bg-[#f8fafd] px-3 py-2.5 text-sm text-[#142238] outline-none transition placeholder:text-[#a0aabc] focus:border-[#5476e8] focus:bg-white focus:ring-4 focus:ring-[#5476e8]/[0.08]"
            />

            {errors.stock && (
              <p className="text-xs text-[#c34452]">{errors.stock.message}</p>
            )}
          </div>
        </div>

        {submitError && (
          <p className="rounded-lg border border-[#f1c8cc] bg-[#fff5f5] px-3 py-2.5 text-sm text-[#a83240]">
            {submitError}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-lg border border-[#dfe5ee] px-4 py-2.5 text-sm font-medium text-[#526178] transition hover:bg-[#f5f7fb] hover:text-[#182840] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-[#345bd7] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#294fc9] disabled:cursor-not-allowed disabled:opacity-50"
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
