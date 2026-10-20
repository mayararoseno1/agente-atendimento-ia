
import { orders } from "../data/orders.js";
import type { Order } from "../models/order.js";

export function findOrderById(id: string): Order | undefined {
  return orders.find((order) => order.id === id);
}
