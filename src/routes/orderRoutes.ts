
import { Router } from "express";
import { findOrderById } from "../services/orderService.js";

export const orderRouter = Router();

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
