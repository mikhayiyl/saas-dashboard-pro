export type UserProfile = {
  name: string;
  email: string;
  role: "admin" | "staff";
  workspaceId: string;
  createdAt: number;
};

export type Product = {
  id: string;
  workspaceId: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  orders: number;
  revenue: number;
  createdAt: number;
  updatedAt: number;
};

export type Customer = {
  id: string;
  workspaceId: string;
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  totalOrders: number;
  totalSpent: number;
  createdAt: number;
};

export type OrderItem = {
  productId: string;
  name: string;
  quantity: number;
  price: number;
};

export type Order = {
  id: string;
  workspaceId: string;
  customerId: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  createdAt: number;
};

export type Activity = {
  id: string;
  workspaceId: string;
  type: "order" | "product" | "customer" | "system";
  message: string;
  timestamp: number;
};

export type Notification = {
  id: string;
  workspaceId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  timestamp: number;
};
