import { z } from "zod";

export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Product name is required")
    .max(100, "Product name is too long"),

  category: z.string().trim().min(1, "Category is required"),

  price: z.coerce.number().min(0, "Price cannot be negative"),

  stock: z.coerce
    .number()
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative"),
});

export type ProductFormData = z.infer<typeof productSchema>;
