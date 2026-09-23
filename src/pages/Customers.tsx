import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { getUserProfile } from "../services/userService";
import {
  deleteCustomer,
  subscribeToCustomers,
} from "../services/customerService";
import type { Customer } from "../types/database";
import CustomerForm from "@/components/customers/CustomerForm";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";

function Customers() {
  const { user } = useAuth();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null,
  );

  const [deletingCustomerId, setDeletingCustomerId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!user) return;

    const uid = user.uid;
    let unsubscribe: (() => void) | undefined;

    async function loadCustomers() {
      try {
        const profile = await getUserProfile(uid);

        if (!profile) {
          throw new Error("User profile not found.");
        }

        setWorkspaceId(profile.workspaceId);

        unsubscribe = subscribeToCustomers(profile.workspaceId, (data) => {
          setCustomers(data);
          setLoading(false);
        });
      } catch (error) {
        console.error("Failed to load customers:", error);
        setLoading(false);
      }
    }

    loadCustomers();

    return () => {
      unsubscribe?.();
    };
  }, [user]);

  function handleAddCustomer() {
    setEditingCustomer(null);
    setShowForm(true);
  }

  function handleEditCustomer(customer: Customer) {
    setEditingCustomer(customer);
    setShowForm(true);
  }

  function handleFormSuccess() {
    setShowForm(false);
    setEditingCustomer(null);
  }

  function handleFormCancel() {
    setShowForm(false);
    setEditingCustomer(null);
  }

  async function handleDeleteCustomer() {
    if (!workspaceId || !customerToDelete) return;

    try {
      setDeletingCustomerId(customerToDelete.id);

      await deleteCustomer(workspaceId, customerToDelete.id);

      setCustomerToDelete(null);
    } catch (error) {
      console.error("Failed to delete customer:", error);
    } finally {
      setDeletingCustomerId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-white/50">Loading customers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Customers</h1>

          <p className="mt-1 text-sm text-white/50">
            Manage and monitor your customers.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddCustomer}
          className="rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-white/90"
        >
          Add Customer
        </button>
      </div>
      {/* customer form */}
      {showForm && workspaceId && (
        <div className="rounded-xl border border-white/10 bg-[#0C0D0F] p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">
              {editingCustomer ? "Edit Customer" : "Add Customer"}
            </h2>

            <p className="mt-1 text-sm text-white/50">
              {editingCustomer
                ? "Update the customer's information."
                : "Create a new customer for this workspace."}
            </p>
          </div>

          <CustomerForm
            workspaceId={workspaceId}
            customer={editingCustomer ?? undefined}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      )}
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0C0D0F]">
        <table className="w-full min-w-200 text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-white/50">
              <th className="px-6 py-4 font-medium">Customer</th>

              <th className="px-6 py-4 font-medium">Email</th>

              <th className="px-6 py-4 font-medium">Phone</th>

              <th className="px-6 py-4 font-medium">Status</th>

              <th className="px-6 py-4 font-medium">Orders</th>

              <th className="px-6 py-4 font-medium">Total Spent</th>

              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            {customers.map((customer) => (
              <tr
                key={customer.id}
                className="border-b border-white/5 last:border-0"
              >
                <td className="px-6 py-4 font-medium text-white">
                  {customer.name}
                </td>

                <td className="px-6 py-4 text-white/60">{customer.email}</td>

                <td className="px-6 py-4 text-white/60">{customer.phone}</td>

                <td className="px-6 py-4">
                  <span
                    className={
                      customer.status === "active"
                        ? "rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400"
                        : "rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium text-white/40"
                    }
                  >
                    {customer.status}
                  </span>
                </td>

                <td className="px-6 py-4 text-white/70">
                  {customer.totalOrders}
                </td>

                <td className="px-6 py-4 text-white/70">
                  ${customer.totalSpent.toLocaleString()}
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditCustomer(customer)}
                      className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/70 transition hover:bg-white/5 hover:text-white"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => setCustomerToDelete(customer)}
                      className="rounded-lg border border-red-500/20 px-3 py-1.5 text-xs text-red-400 transition hover:bg-red-500/10"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmDeleteModal
        open={Boolean(customerToDelete)}
        itemName={customerToDelete?.name ?? ""}
        itemType="customer"
        isDeleting={deletingCustomerId !== null}
        onConfirm={handleDeleteCustomer}
        onCancel={() => setCustomerToDelete(null)}
      />
    </div>
  );
}

export default Customers;
