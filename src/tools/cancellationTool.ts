
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { cancelOrder, findOrderById } from "../services/orderService.js";

export const cancelarPedidoTool = tool(
  async ({ orderId, customerId, confirmed }) => {
    if (!confirmed) {
      return JSON.stringify({
        success: false,
        reason: "CONFIRMATION_REQUIRED",
        message: "É necessário confirmar o cancelamento.",
      });
    }

    const order = findOrderById(orderId);

    if (!order || order.customerId !== customerId) {
      return JSON.stringify({
        success: false,
        reason: "ORDER_NOT_FOUND",
        message: "Pedido não encontrado.",
      });
    }

    const result = cancelOrder(orderId);

    if (!result.success) {
      return JSON.stringify({
        success: false,
        reason: result.reason,
        message: "O pedido não pode ser cancelado.",
      });
    }

    return JSON.stringify({
      success: true,
      orderId: result.order.id,
      status: result.order.status,
      message: "Pedido cancelado com sucesso.",
    });
  },
  {
    name: "cancelar_pedido",
    description:
      "Cancela um pedido somente após confirmação explícita validada pelo backend.",
    schema: z.object({
      orderId: z.string().regex(/^ORD-\d{3}$/),
      customerId: z.string(),
      confirmed: z.boolean(),
    }),
  }
);
