import { z } from "zod";

export const customerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Customer name is required")
    .max(100, "Customer name is too long"),

  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),

  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .max(20, "Phone number is too long"),

  status: z.enum(["active", "inactive"]),
});

export type CustomerFormData = z.infer<typeof customerSchema>;
