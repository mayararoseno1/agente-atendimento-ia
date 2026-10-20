
import type { Order } from "../models/order.js";

export const orders: Order[] = [
  {
    id: "ORD-001",
    customerId: "CUS-001",
    productId: 1,
    quantity: 1,
    status: "processing",
    createdAt: "2026-10-15T10:00:00Z",
  },
  {
    id: "ORD-002",
    customerId: "CUS-002",
    productId: 2,
    quantity: 2,
    status: "shipped",
    createdAt: "2026-10-14T14:30:00Z",
  },
  {
    id: "ORD-003",
    customerId: "CUS-003",
    productId: 3,
    quantity: 1,
    status: "cancelled",
    createdAt: "2026-10-13T09:15:00Z",
  },
];
