
import { Router } from "express";
import { getProductById } from "../services/productService.js";

export const productRouter = Router();

productRouter.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  // Valida o identificador do produto
  if (!Number.isSafeInteger(id) || id <= 0) {
    res.status(400).json({
      error: "INVALID_PRODUCT_ID",
      message: "O identificador do produto é inválido.",
    });
    return;
  }

  const result = await getProductById(id);

  if (!result.success) {
    if (result.reason === "NOT_FOUND") {
      res.status(404).json({
        error: "PRODUCT_NOT_FOUND",
        message: "Produto não encontrado.",
      });
      return;
    }

    res.status(502).json({
      error: "EXTERNAL_API_ERROR",
      message: "Não foi possível consultar o produto no momento.",
    });
    return;
  }

  res.status(200).json(result.product);
});
