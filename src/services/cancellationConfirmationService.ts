import { randomUUID } from "node:crypto";
import { cancelOrder, findOrderById } from "./orderService.js";

const CONFIRMATION_TIMEOUT_MS = 5 * 60 * 1000;


type PendingCancellation = {
  requestId: string;
  orderId: string;
  customerId: string;
  expiresAt: number;
};

const pendingCancellations = new Map<string, PendingCancellation>();

export type CancellationRequestResult =
  | { success: true; orderId: string }
  | {
      success: false;
      reason: "ORDER_NOT_FOUND" | "NOT_CANCELLABLE";
    };

export function requestCancellation(
  customerId: string,
  orderId: string
): CancellationRequestResult {
  const order = findOrderById(orderId);

  if (!order || order.customerId !== customerId) {
    return {
      success: false,
      reason: "ORDER_NOT_FOUND",
    };
  }

  if (order.status !== "processing") {
    return {
      success: false,
      reason: "NOT_CANCELLABLE",
    };
  }

pendingCancellations.set(customerId, {
  requestId: randomUUID(),
  customerId,
  orderId,
  expiresAt: Date.now() + CONFIRMATION_TIMEOUT_MS,
});


  return {
    success: true,
    orderId,
  };
}


export function getPendingCancellation(
  customerId: string
): PendingCancellation | undefined {
  const pending = pendingCancellations.get(customerId);

  if (!pending) {
    return undefined;
  }

  if (Date.now() >= pending.expiresAt) {
    pendingCancellations.delete(customerId);
    return undefined;
  }

  return pending;
}


export function clearPendingCancellation(
  customerId: string
): void {
  pendingCancellations.delete(customerId);
}


export type ConfirmCancellationResult =
  | { success: true; orderId: string; status: "cancelled" }
  | {
      success: false;
      reason: "CONFIRMATION_REQUIRED" | "NOT_CANCELLABLE";
    };

export function confirmPendingCancellation(
  customerId: string,
  orderId: string
): ConfirmCancellationResult {
  const pending = getPendingCancellation(customerId);

  if (!pending || pending.orderId !== orderId) {
    return {
      success: false,
      reason: "CONFIRMATION_REQUIRED",
    };
  }

  // Consome a confirmação para impedir reutilização.
  clearPendingCancellation(customerId);

  // Revalida a propriedade e o status do pedido.
  const order = findOrderById(orderId);

  if (!order || order.customerId !== customerId) {
    return {
      success: false,
      reason: "CONFIRMATION_REQUIRED",
    };
  }

  const result = cancelOrder(orderId);

  if (!result.success) {
    return {
      success: false,
      reason: "NOT_CANCELLABLE",
    };
  }

  return {
    success: true,
    orderId: result.order.id,
    status: "cancelled",
  };
}
