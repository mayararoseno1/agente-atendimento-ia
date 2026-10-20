
import { orders } from "../data/orders.js";
import type { Order } from "../models/order.js";

export function findOrderById(id: string): Order | undefined {
  return orders.find((order) => order.id === id);
}

export type CancellationResult =
  | { success: true; order: Order }
  | {
      success: false;
      reason: "NOT_FOUND" | "NOT_CANCELLABLE";
    };

export function cancelOrder(id: string): CancellationResult {
  const order = findOrderById(id);

  if (!order) {
    return { success: false, reason: "NOT_FOUND" };
  }

  if (order.status !== "processing") {
    return { success: false, reason: "NOT_CANCELLABLE" };
  }

  order.status = "cancelled";

  return { success: true, order };
}
