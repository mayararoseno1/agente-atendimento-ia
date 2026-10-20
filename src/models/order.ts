
export type OrderStatus = "processing" | "shipped" | "cancelled";

export interface Order {
  id: string;
  customerId: string;
  productId: number;
  quantity: number;
  status: OrderStatus;
  createdAt: string;
}
