
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { getProductById } from "../services/productService.js";

export const consultarProdutoTool = tool(
 async ({ productId }) => {
  if (!Number.isSafeInteger(productId) || productId <= 0) {
    return JSON.stringify({
      success: false,
      reason: "INVALID_PRODUCT_ID",
      message: "O identificador do produto deve ser um número inteiro positivo.",
    });
  }

  try {
      const result = await getProductById(productId);

      if (!result.success) {
        return JSON.stringify({
          success: false,
          reason: result.reason,
          message:
            result.reason === "NOT_FOUND"
              ? "Produto não encontrado."
              : "Não foi possível consultar o produto no momento.",
        });
      }

      return JSON.stringify({
        success: true,
        product: result.product,
      });
    } catch {
      return JSON.stringify({
        success: false,
        reason: "EXTERNAL_API_ERROR",
        message: "Não foi possível consultar o produto no momento.",
      });
    }
  },
  {
    name: "consultar_produto",
    description:
      "Consulta informações complementares de um produto, como nome, preço, descrição e categoria. Não consulta status de pedidos nem realiza cancelamentos.",
  schema: z.object({
  productId: z
    .number()
    .describe("Identificador numérico positivo do produto, como 1 ou 2."),
    }),
  }
);
