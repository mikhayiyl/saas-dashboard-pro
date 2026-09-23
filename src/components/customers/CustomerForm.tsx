import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  customerSchema,
  type CustomerFormData,
} from "../../schemas/customerSchema";

import { createCustomer, updateCustomer } from "../../services/customerService";

import type { Customer } from "../../types/database";

type CustomerFormProps = {
  workspaceId: string;
  customer?: Customer;
  onSuccess: () => void;
  onCancel: () => void;
};

function CustomerForm({
  workspaceId,
  customer,
  onSuccess,
  onCancel,
}: CustomerFormProps) {
  const isEditMode = Boolean(customer);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      status: "active",
    },
  });

  useEffect(() => {
    if (customer) {
      reset({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        status: customer.status,
      });
    } else {
      reset({
        name: "",
        email: "",
        phone: "",
        status: "active",
      });
    }
  }, [customer, reset]);

  async function onSubmit(data: CustomerFormData) {
    try {
      if (customer) {
        await updateCustomer(workspaceId, customer.id, {
          name: data.name,
          email: data.email,
          phone: data.phone,
          status: data.status,
        });
      } else {
        await createCustomer({
          workspaceId,
          name: data.name,
          email: data.email,
          phone: data.phone,
          status: data.status,
        });
      }

      onSuccess();
    } catch (error) {
      console.error(
        `Failed to ${isEditMode ? "update" : "create"} customer:`,
        error,
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-white">
          Customer Name
        </label>

        <input
          {...register("name")}
          placeholder="John Kamau"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/20"
        />

        {errors.name && (
          <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white">
          Email
        </label>

        <input
          {...register("email")}
          type="email"
          placeholder="john@example.com"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/20"
        />

        {errors.email && (
          <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white">
          Phone
        </label>

        <input
          {...register("phone")}
          type="tel"
          placeholder="+254712345678"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/20"
        />

        {errors.phone && (
          <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white">
          Status
        </label>

        <select
          {...register("status")}
          className="w-full rounded-lg border border-white/10 bg-[#0C0D0F] px-4 py-2.5 text-sm text-white outline-none focus:border-white/20"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {errors.status && (
          <p className="mt-1 text-xs text-red-400">{errors.status.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-lg border border-white/10 px-4 py-2.5 text-sm text-white/70 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-50"
        >
          {isSubmitting
            ? isEditMode
              ? "Updating..."
              : "Creating..."
            : isEditMode
              ? "Update Customer"
              : "Create Customer"}
        </button>
      </div>
    </form>
  );
}

export default CustomerForm;
