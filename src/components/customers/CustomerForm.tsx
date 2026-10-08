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
        <label className="mb-2 block text-sm font-medium text-[#34435a]">
          Customer Name
        </label>

        <input
          {...register("name")}
          placeholder="John Kamau"
          className="w-full rounded-lg border border-[#dfe5ee] bg-[#f8fafd] px-4 py-2.5 text-sm text-[#142238] outline-none placeholder:text-[#a0aabc] focus:border-[#5476e8] focus:bg-white focus:ring-4 focus:ring-[#5476e8]/[0.08]"
        />

        {errors.name && (
          <p className="mt-1 text-xs text-[#c34452]">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-[#34435a]">
          Email
        </label>

        <input
          {...register("email")}
          type="email"
          placeholder="john@example.com"
          className="w-full rounded-lg border border-[#dfe5ee] bg-[#f8fafd] px-4 py-2.5 text-sm text-[#142238] outline-none placeholder:text-[#a0aabc] focus:border-[#5476e8] focus:bg-white focus:ring-4 focus:ring-[#5476e8]/[0.08]"
        />

        {errors.email && (
          <p className="mt-1 text-xs text-[#c34452]">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-[#34435a]">
          Phone
        </label>

        <input
          {...register("phone")}
          type="tel"
          placeholder="+254712345678"
          className="w-full rounded-lg border border-[#dfe5ee] bg-[#f8fafd] px-4 py-2.5 text-sm text-[#142238] outline-none placeholder:text-[#a0aabc] focus:border-[#5476e8] focus:bg-white focus:ring-4 focus:ring-[#5476e8]/[0.08]"
        />

        {errors.phone && (
          <p className="mt-1 text-xs text-[#c34452]">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-[#34435a]">
          Status
        </label>

        <select
          {...register("status")}
          className="w-full rounded-lg border border-[#dfe5ee] bg-[#f8fafd] px-4 py-2.5 text-sm text-[#142238] outline-none focus:border-[#5476e8] focus:bg-white"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {errors.status && (
          <p className="mt-1 text-xs text-[#c34452]">{errors.status.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-lg border border-[#dfe5ee] px-4 py-2.5 text-sm text-[#526178] transition hover:bg-[#f5f7fb] hover:text-[#182840] disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-[#345bd7] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#294fc9] disabled:opacity-50"
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
