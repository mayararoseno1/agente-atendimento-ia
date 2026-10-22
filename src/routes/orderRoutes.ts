
import { Router } from "express";
import { logger } from "../config/logger.js";
import { findOrderById } from "../services/orderService.js";
import {
  requestCancellation,
  confirmPendingCancellation,
} from "../services/cancellationConfirmationService.js";


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


orderRouter.post("/:id/cancellation-request", (req, res) => {
  const id = req.params.id;
  const customerId = req.body?.customerId;

  if (typeof id !== "string" || !/^ORD-\d{3}$/.test(id)) {
    res.status(400).json({
      error: "INVALID_ORDER_ID",
      message: "O identificador do pedido é inválido.",
    });
    return;
  }

  if (typeof customerId !== "string" || !customerId.trim()) {
    res.status(400).json({
      error: "INVALID_CUSTOMER_ID",
      message: "A identificação do cliente é obrigatória.",
    });
    return;
  }

  const result = requestCancellation(customerId, id);

  if (!result.success) {
    const status = result.reason === "ORDER_NOT_FOUND" ? 404 : 409;

    res.status(status).json({
      error: result.reason,
      message:
        result.reason === "ORDER_NOT_FOUND"
          ? "Pedido não encontrado para este cliente."
          : "Este pedido não pode ser cancelado.",
    });
    return;
  }

  res.status(200).json({
    orderId: result.orderId,
    confirmationRequired: true,
    message: `Você confirma o cancelamento do pedido ${result.orderId}?`,
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

  const result = confirmPendingCancellation(req.body.customerId, id);

  logger.info(
    {
      event: "order_cancellation",
      orderId: id,
      outcome: result.success ? "success" : result.reason,
    },
    "Tentativa de cancelamento processada"
  );
  
  if (!result.success) {
    res.status(409).json({
      error: result.reason,
      message: "Este pedido não pode ser cancelado no estado atual.",
    });
    return;
  }

  res.status(200).json({
  id: result.orderId,
  status: result.status,
  message: "Pedido cancelado com sucesso.",
});
});
