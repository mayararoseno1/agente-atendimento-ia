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
    clearPendingCancellation("CUS-001");
    clearPendingCancellation("CUS-002");
    const order = orders.find((item) => item.id === "ORD-001");
    if (order) order.status = "processing";
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
        expiresAt: expect.any(Number),
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
it("descarta a confirmação após 5 minutos", () => {
  vi.useFakeTimers();

  try {
    vi.setSystemTime(new Date("2026-10-21T10:00:00Z"));

    const result = requestCancellation("CUS-001", "ORD-001");

    expect(result.success).toBe(true);
    expect(getPendingCancellation("CUS-001")).toBeDefined();

    vi.advanceTimersByTime(5 * 60 * 1000);

    expect(getPendingCancellation("CUS-001")).toBeUndefined();
  } finally {
    clearPendingCancellation("CUS-001");
    vi.useRealTimers();
  }
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

it("impede cancelar um pedido após a confirmação expirar", () => {
  vi.useFakeTimers();

  try {
    vi.setSystemTime(new Date("2026-10-21T10:00:00Z"));

    const request = requestCancellation("CUS-001", "ORD-001");

    expect(request.success).toBe(true);

    // Simula a passagem de 5 minutos.
    vi.advanceTimersByTime(5 * 60 * 1000);

    // O cliente tenta confirmar após o prazo.
    const result = confirmPendingCancellation(
      "CUS-001",
      "ORD-001"
    );

    expect(result).toEqual({
      success: false,
      reason: "CONFIRMATION_REQUIRED",
    });

    // O pedido deve continuar em processamento.
    expect(findOrderById("ORD-001")?.status).toBe("processing");

    // A solicitação expirada deve ser removida.
    expect(getPendingCancellation("CUS-001")).toBeUndefined();
  } finally {
    clearPendingCancellation("CUS-001");
    vi.useRealTimers();
  }
});

it("impede cancelamento após a confirmação expirar", () => {
  vi.useFakeTimers();

  try {
    vi.setSystemTime(new Date("2026-10-21T10:00:00Z"));

    // Cliente solicita o cancelamento.
    const request = requestCancellation("CUS-001", "ORD-001");

    expect(request.success).toBe(true);

    // Avançamos o relógio em 5 minutos.
    vi.advanceTimersByTime(5 * 60 * 1000);

    // Cliente tenta confirmar após o prazo.
    const result = confirmPendingCancellation(
      "CUS-001",
      "ORD-001"
    );

    // Backend deve recusar.
    expect(result).toEqual({
      success: false,
      reason: "CONFIRMATION_REQUIRED",
    });

    // Pedido não pode ter sido cancelado.
    expect(findOrderById("ORD-001")?.status).toBe("processing");

    // A solicitação expirada deve desaparecer.
    expect(getPendingCancellation("CUS-001")).toBeUndefined();
  } finally {
    clearPendingCancellation("CUS-001");
    vi.useRealTimers();
  }
});

});
