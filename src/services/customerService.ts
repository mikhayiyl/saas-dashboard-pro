import {
  get,
  onValue,
  push,
  ref,
  remove,
  set,
  update,
} from "firebase/database";

import { db } from "../lib/firebase";
import type { Customer } from "../types/database";

type CreateCustomerData = Omit<
  Customer,
  "id" | "createdAt" | "totalOrders" | "totalSpent"
>;

type UpdateCustomerData = Partial<
  Omit<
    Customer,
    "id" | "workspaceId" | "createdAt" | "totalOrders" | "totalSpent"
  >
>;

export async function createCustomer(
  data: CreateCustomerData,
): Promise<string> {
  const customersRef = ref(db, `workspaces/${data.workspaceId}/customers`);

  const customerRef = push(customersRef);

  if (!customerRef.key) {
    throw new Error("Unable to generate customer ID.");
  }

  const customer: Customer = {
    ...data,
    id: customerRef.key,
    totalOrders: 0,
    totalSpent: 0,
    createdAt: Date.now(),
  };

  await set(customerRef, customer);

  return customerRef.key;
}

export async function getCustomer(
  workspaceId: string,
  customerId: string,
): Promise<Customer | null> {
  const customerRef = ref(
    db,
    `workspaces/${workspaceId}/customers/${customerId}`,
  );

  const snapshot = await get(customerRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    ...(snapshot.val() as Customer),
    id: snapshot.key ?? customerId,
  };
}

export async function updateCustomer(
  workspaceId: string,
  customerId: string,
  data: UpdateCustomerData,
): Promise<void> {
  const customerRef = ref(
    db,
    `workspaces/${workspaceId}/customers/${customerId}`,
  );

  await update(customerRef, data);
}

export async function deleteCustomer(
  workspaceId: string,
  customerId: string,
): Promise<void> {
  const customerRef = ref(
    db,
    `workspaces/${workspaceId}/customers/${customerId}`,
  );

  await remove(customerRef);
}

export function subscribeToCustomers(
  workspaceId: string,
  callback: (customers: Customer[]) => void,
) {
  const customersRef = ref(db, `workspaces/${workspaceId}/customers`);

  return onValue(customersRef, (snapshot) => {
    const customers: Customer[] = [];

    snapshot.forEach((childSnapshot) => {
      const customer = childSnapshot.val() as Customer;

      customers.push({
        ...customer,
        id: childSnapshot.key ?? customer.id,
      });
    });

    callback(customers);
  });
}
