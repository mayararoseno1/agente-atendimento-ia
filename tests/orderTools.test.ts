
import { describe, expect, it } from "vitest";
import { consultarPedidoTool } from "../src/tools/orderTools.js";

describe("Tool consultar_pedido", () => {
  it("consulta um pedido existente", async () => {
    const response = await consultarPedidoTool.invoke({
      orderId: "ORD-001",
    });

    const result = JSON.parse(String(response));

    expect(result.success).toBe(true);
    expect(result.order.id).toBe("ORD-001");
    expect(result.order).toHaveProperty("status");
  });

  it("retorna erro quando o pedido não existe", async () => {
    const response = await consultarPedidoTool.invoke({
      orderId: "ORD-999",
    });

    const result = JSON.parse(String(response));

    expect(result).toEqual({
      success: false,
      reason: "ORDER_NOT_FOUND",
      message: "Pedido não encontrado.",
    });
  });

  it("não expõe o customerId na resposta", async () => {
    const response = await consultarPedidoTool.invoke({
      orderId: "ORD-001",
    });

    const result = JSON.parse(String(response));

    expect(result.order).not.toHaveProperty("customerId");
  });
});
