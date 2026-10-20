
import { Router } from "express";
import { cancelOrder, findOrderById } from "../services/orderService.js";

export const orderRouter = Router();

// GET - Consultar um pedido
orderRouter.get("/:id", (req, res) => {
  const id = req.params.id;

  if (typeof id !== "string" || !/^ORD-\d{3}$/.test(id)) {
    res.status(400).json({
      error: "INVALID_ORDER_ID",
      message: "O identificador do pedido é inválido.",
    });
    return;
  }

  const order = findOrderById(id);

  if (!order) {
    res.status(404).json({
      error: "ORDER_NOT_FOUND",
      message: "Pedido não encontrado.",
    });
    return;
  }

  res.status(200).json({
    id: order.id,
    status: order.status,
    productId: order.productId,
    quantity: order.quantity,
    createdAt: order.createdAt,
  });
});

// POST - Solicitar cancelamento de um pedido
orderRouter.post("/:id/cancel", (req, res) => {
  const id = req.params.id;

  if (typeof id !== "string" || !/^ORD-\d{3}$/.test(id)) {
    res.status(400).json({
      error: "INVALID_ORDER_ID",
      message: "O identificador do pedido é inválido.",
    });
    return;
  }

  if (
    req.body?.confirmed !== true ||
    typeof req.body?.customerId !== "string"
  ) {
    res.status(400).json({
      error: "INVALID_CANCELLATION_REQUEST",
      message: "Confirmação explícita e identificação do cliente são obrigatórias.",
    });
    return;
  }

  const order = findOrderById(id);

  if (!order) {
    res.status(404).json({
      error: "ORDER_NOT_FOUND",
      message: "Pedido não encontrado.",
    });
    return;
  }

  // Verificação demonstrativa, não substitui autenticação real.
  if (order.customerId !== req.body.customerId) {
    res.status(403).json({
      error: "CUSTOMER_MISMATCH",
      message: "Não foi possível autorizar o cancelamento deste pedido.",
    });
    return;
  }

  const result = cancelOrder(id);

  if (!result.success) {
    res.status(409).json({
      error: "ORDER_NOT_CANCELLABLE",
      message: "Este pedido não pode ser cancelado no estado atual.",
    });
    return;
  }

  res.status(200).json({
    id: result.order.id,
    status: result.order.status,
    message: "Pedido cancelado com sucesso.",
  });
});
