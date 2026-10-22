
import { z } from "zod";
import { consultarPedidoTool } from "../tools/orderTools.js";
import { consultarProdutoTool } from "../tools/productTools.js";
import { findOrderById } from "../services/orderService.js";
import { requestCancellation } from "../services/cancellationConfirmationService.js";

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

if (name === "solicitar_cancelamento") {
  const validation = orderArgsSchema.safeParse(args);

  if (!validation.success) {
    return JSON.stringify({
      success: false,
      reason: "INVALID_ARGUMENTS",
      message: "Identificador do pedido inválido.",
    });
  }

  const result = requestCancellation(
    context.customerId,
    validation.data.orderId
  );

  if (!result.success) {
    return JSON.stringify({
      success: false,
      reason: result.reason,
      message:
        result.reason === "ORDER_NOT_FOUND"
          ? "Pedido não encontrado para este cliente."
          : "Este pedido não pode ser cancelado.",
    });
  }

  return JSON.stringify({
    success: true,
    orderId: result.orderId,
    confirmationRequired: true,
    message: `Pergunte ao cliente se confirma o cancelamento do pedido ${result.orderId}. Não cancele ainda.`,
  });
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
