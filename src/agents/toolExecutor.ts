
import { z } from "zod";
import { consultarPedidoTool } from "../tools/orderTools.js";
import { consultarProdutoTool } from "../tools/productTools.js";
import { findOrderById } from "../services/orderService.js";

const orderArgsSchema = z.object({
  orderId: z.string().regex(/^ORD-\d{3}$/),
});

const productArgsSchema = z.object({
  productId: z.number(),
});

export interface ToolExecutionContext {
  customerId: string;
}

export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  context: ToolExecutionContext
): Promise<string> {
  if (name === "consultar_pedido") {
    const validation = orderArgsSchema.safeParse(args);

    if (!validation.success) {
      return JSON.stringify({
        success: false,
        reason: "INVALID_ARGUMENTS",
        message: "Parâmetros inválidos para consultar o pedido.",
      });
    }

    const order = findOrderById(validation.data.orderId);

    if (!order || order.customerId !== context.customerId) {
      return JSON.stringify({
        success: false,
        reason: "ORDER_NOT_FOUND",
        message: "Pedido não encontrado.",
      });
    }

    return String(
      await consultarPedidoTool.invoke(validation.data)
    );
  }

  if (name === "consultar_produto") {
    const validation = productArgsSchema.safeParse(args);

    if (!validation.success) {
      return JSON.stringify({
        success: false,
        reason: "INVALID_ARGUMENTS",
        message: "Parâmetros inválidos para consultar o produto.",
      });
    }

    return String(
      await consultarProdutoTool.invoke(validation.data)
    );
  }

if (name === "cancelar_pedido") {
  return JSON.stringify({
    success: false,
    reason: "CONFIRMATION_REQUIRED",
    message:
      "O cancelamento precisa de confirmação explícita do cliente, validada pelo backend.",
  });
}
  return JSON.stringify({
    success: false,
    reason: "TOOL_NOT_ALLOWED",
    message: "Ferramenta não autorizada.",
  });
}
