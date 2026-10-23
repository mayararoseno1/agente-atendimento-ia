
import { orders } from "../src/data/orders.js";
import { findOrderById } from "../src/services/orderService.js";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  requestCancellation,
  getPendingCancellation,
  clearPendingCancellation,
  confirmPendingCancellation,
} from "../src/services/cancellationConfirmationService.js";

describe("Confirmação de cancelamento", () => {
  afterEach(() => {
    vi.useRealTimers();

    clearPendingCancellation("CUS-001");
    clearPendingCancellation("CUS-002");

    const order = orders.find((item) => item.id === "ORD-001");

    if (order) {
      order.status = "processing";
    }
  });

  it("registra uma solicitação sem cancelar o pedido", () => {
    const result = requestCancellation("CUS-001", "ORD-001");

    expect(result).toEqual({
      success: true,
      orderId: "ORD-001",
    });

    expect(getPendingCancellation("CUS-001")).toEqual({
      requestId: expect.any(String),
      customerId: "CUS-001",
      orderId: "ORD-001",
    });

    expect(findOrderById("ORD-001")?.status).toBe("processing");
  });

  it("não registra pedidos de outros clientes", () => {
    const result = requestCancellation("CUS-001", "ORD-002");

    expect(result).toEqual({
      success: false,
      reason: "ORDER_NOT_FOUND",
    });

    expect(getPendingCancellation("CUS-001")).toBeUndefined();
  });

  it("não registra pedidos que não podem ser cancelados", () => {
    const result = requestCancellation("CUS-002", "ORD-002");

    expect(result).toEqual({
      success: false,
      reason: "NOT_CANCELLABLE",
    });

    expect(getPendingCancellation("CUS-002")).toBeUndefined();
  });

  it("mantém a solicitação pendente após cinco minutos", () => {
    vi.useFakeTimers();

    vi.setSystemTime(new Date("2026-10-21T10:00:00Z"));

    const request = requestCancellation("CUS-001", "ORD-001");

    expect(request.success).toBe(true);

    vi.advanceTimersByTime(6 * 60 * 1000);

    expect(getPendingCancellation("CUS-001")).toBeDefined();
    expect(findOrderById("ORD-001")?.status).toBe("processing");
  });

  it("bloqueia cancelamento sem solicitação pendente", () => {
    clearPendingCancellation("CUS-001");

    const result = confirmPendingCancellation(
      "CUS-001",
      "ORD-001"
    );

    expect(result).toEqual({
      success: false,
      reason: "CONFIRMATION_REQUIRED",
    });

    expect(findOrderById("ORD-001")?.status).toBe("processing");
  });

  it("cancela o pedido após uma confirmação válida", () => {
    const request = requestCancellation("CUS-001", "ORD-001");

    expect(request.success).toBe(true);

    const result = confirmPendingCancellation(
      "CUS-001",
      "ORD-001"
    );

    expect(result).toEqual({
      success: true,
      orderId: "ORD-001",
      status: "cancelled",
    });

    expect(findOrderById("ORD-001")?.status).toBe("cancelled");
    expect(getPendingCancellation("CUS-001")).toBeUndefined();
  });

  it("impede reutilizar uma confirmação de cancelamento", () => {
    requestCancellation("CUS-001", "ORD-001");

    const firstResult = confirmPendingCancellation(
      "CUS-001",
      "ORD-001"
    );

    expect(firstResult.success).toBe(true);

    const secondResult = confirmPendingCancellation(
      "CUS-001",
      "ORD-001"
    );

    expect(secondResult).toEqual({
      success: false,
      reason: "CONFIRMATION_REQUIRED",
    });

    expect(getPendingCancellation("CUS-001")).toBeUndefined();
  });

  it("revalida o status do pedido antes de cancelar", () => {
    requestCancellation("CUS-001", "ORD-001");

    const order = orders.find((item) => item.id === "ORD-001");

    if (!order) {
      throw new Error("Pedido de teste não encontrado");
    }

    order.status = "shipped";

    const result = confirmPendingCancellation(
      "CUS-001",
      "ORD-001"
    );

    expect(result).toEqual({
      success: false,
      reason: "NOT_CANCELLABLE",
    });

    expect(order.status).toBe("shipped");
    expect(getPendingCancellation("CUS-001")).toBeUndefined();
  });
});
