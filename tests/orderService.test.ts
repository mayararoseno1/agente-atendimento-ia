
import { beforeEach, describe, expect, it } from "vitest";
import { orders } from "../src/data/orders.js";
import {
  cancelOrder,
  findOrderById,
} from "../src/services/orderService.js";

describe("Serviço de pedidos", () => {
  beforeEach(() => {
    // Restaura os estados antes de cada teste.
    orders[0].status = "processing";
    orders[1].status = "shipped";
    orders[2].status = "cancelled";
  });

  it("deve encontrar um pedido existente", () => {
    const order = findOrderById("ORD-001");

    expect(order).toBeDefined();
    expect(order?.status).toBe("processing");
  });

  it("deve retornar undefined para pedido inexistente", () => {
    const order = findOrderById("ORD-999");

    expect(order).toBeUndefined();
  });

  it("deve cancelar um pedido em processamento", () => {
    const result = cancelOrder("ORD-001");

    expect(result.success).toBe(true);
    expect(findOrderById("ORD-001")?.status).toBe("cancelled");
  });

  it("não deve cancelar um pedido enviado", () => {
    const result = cancelOrder("ORD-002");

    expect(result).toEqual({
      success: false,
      reason: "NOT_CANCELLABLE",
    });

    expect(findOrderById("ORD-002")?.status).toBe("shipped");
  });

  it("não deve cancelar um pedido já cancelado", () => {
    const result = cancelOrder("ORD-003");

    expect(result).toEqual({
      success: false,
      reason: "NOT_CANCELLABLE",
    });
  });

  it("não deve cancelar um pedido inexistente", () => {
    const result = cancelOrder("ORD-999");

    expect(result).toEqual({
      success: false,
      reason: "NOT_FOUND",
    });
  });
});
