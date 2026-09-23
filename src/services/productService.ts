import { onValue, push, ref, remove, set, update } from "firebase/database";

import { db } from "../lib/firebase";

import type { Product } from "../types/database";

type CreateProductData = Omit<Product, "id" | "createdAt" | "updatedAt">;

export async function createProduct(data: CreateProductData): Promise<string> {
  const productsRef = ref(db, `workspaces/${data.workspaceId}/products`);

  const productRef = push(productsRef);

  if (!productRef.key) {
    throw new Error("Unable to generate product ID.");
  }

  const now = Date.now();

  const product: Product = {
    ...data,
    id: productRef.key,
    createdAt: now,
    updatedAt: now,
  };

  await set(productRef, product);

  return productRef.key;
}

export async function updateProduct(
  workspaceId: string,
  productId: string,
  data: Partial<Omit<Product, "id" | "workspaceId" | "createdAt">>,
) {
  const productRef = ref(db, `workspaces/${workspaceId}/products/${productId}`);

  await update(productRef, {
    ...data,
    updatedAt: Date.now(),
  });
}

export async function deleteProduct(workspaceId: string, productId: string) {
  const productRef = ref(db, `workspaces/${workspaceId}/products/${productId}`);

  await remove(productRef);
}

export function subscribeToProducts(
  workspaceId: string,
  callback: (products: Product[]) => void,
) {
  const productsRef = ref(db, `workspaces/${workspaceId}/products`);

  return onValue(productsRef, (snapshot) => {
    const products: Product[] = [];

    snapshot.forEach((childSnapshot) => {
      const product = childSnapshot.val() as Product;

      products.push({
        ...product,
        id: childSnapshot.key ?? product.id,
      });
    });

    callback(products);
  });
}
