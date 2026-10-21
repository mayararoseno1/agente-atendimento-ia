
import { describe, expect, it } from "vitest";
import { executeTool } from "../src/agents/toolExecutor.js";

const customerContext = {
  customerId: "CUS-001",
};

describe("Executor de ferramentas", () => {
  it("bloqueia ferramentas não autorizadas", async () => {
    const response = await executeTool(
      "excluir_pedido",
      { orderId: "ORD-001" },
      customerContext
    );

    expect(JSON.parse(response).reason).toBe("TOOL_NOT_ALLOWED");
  });

  it("permite consultar um pedido do cliente", async () => {
    const response = await executeTool(
      "consultar_pedido",
      { orderId: "ORD-001" },
      customerContext
    );

    const result = JSON.parse(response);

    expect(result.success).toBe(true);
    expect(result.order.id).toBe("ORD-001");
  });

  it("impede consultar um pedido de outro cliente", async () => {
    const response = await executeTool(
      "consultar_pedido",
      { orderId: "ORD-002" },
      customerContext
    );

    const result = JSON.parse(response);

    expect(result.success).toBe(false);
    expect(result.reason).toBe("ORDER_NOT_FOUND");
  });

  it("rejeita um identificador de pedido inválido", async () => {
    const response = await executeTool(
      "consultar_pedido",
      { orderId: "pedido-qualquer" },
      customerContext
    );

    expect(JSON.parse(response).reason).toBe("INVALID_ARGUMENTS");
  });

  it("rejeita um identificador de produto que não seja número", async () => {
    const response = await executeTool(
      "consultar_produto",
      { productId: "abc" },
      customerContext
    );

    expect(JSON.parse(response).reason).toBe("INVALID_ARGUMENTS");
  });

  it("rejeita um produto com identificador negativo", async () => {
    const response = await executeTool(
      "consultar_produto",
      { productId: -1 },
      customerContext
    );

    expect(JSON.parse(response).reason).toBe("INVALID_PRODUCT_ID");
  });
it("bloqueia cancelamento mesmo quando o Gemini envia confirmed true", async () => {
  const result = await executeTool(
    "cancelar_pedido",
    {
      orderId: "ORD-001",
      customerId: "CUS-001",
      confirmed: true,
    },
    { customerId: "CUS-001" }
  );

  const response = JSON.parse(result);

  expect(response).toEqual({
    success: false,
    reason: "CONFIRMATION_REQUIRED",
    message:
      "O cancelamento precisa de confirmação explícita do cliente, validada pelo backend.",
  });
});

});
