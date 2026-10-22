
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { findOrderById } from "../services/orderService.js";

export const consultarPedidoTool = tool(
  async ({ orderId }) => {
    const order = findOrderById(orderId);

    if (!order) {
      return JSON.stringify({
        success: false,
        reason: "ORDER_NOT_FOUND",
        message: "Pedido não encontrado.",
      });
    }

    return JSON.stringify({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        productId: order.productId,
        quantity: order.quantity,
        createdAt: order.createdAt,
      },
    });
  },
  {
    name: "consultar_pedido",
    description:
      "Consulta o status e os dados de um pedido existente. Não realiza cancelamentos.",
    schema: z.object({
      orderId: z
        .string()
        .regex(/^ORD-\d{3}$/, "Identificador de pedido inválido.")
        .describe("Identificador do pedido, como ORD-001."),
    }),
  }
);
