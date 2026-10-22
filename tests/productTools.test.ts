
import { describe, expect, it, vi } from "vitest";
import { consultarProdutoTool } from "../src/tools/productTools.js";
import { getProductById } from "../src/services/productService.js";

vi.mock("../src/services/productService.js", () => ({
  getProductById: vi.fn(),
}));

describe("Tool consultar_produto", () => {
  it("retorna informações de um produto existente", async () => {
    vi.mocked(getProductById).mockResolvedValueOnce({
      success: true,
      product: {
        id: 1,
        title: "Produto de teste",
        price: 99.9,
        description: "Descrição de teste",
        category: "electronics",
        image: "https://example.com/product.png",
      },
    });

    const response = await consultarProdutoTool.invoke({
      productId: 1,
    });

    const result = JSON.parse(String(response));

    expect(result.success).toBe(true);
    expect(result.product.id).toBe(1);
    expect(result.product.title).toBe("Produto de teste");
  });

  it("informa quando o produto não existe", async () => {
    vi.mocked(getProductById).mockResolvedValueOnce({
      success: false,
      reason: "NOT_FOUND",
    });

    const response = await consultarProdutoTool.invoke({
      productId: 999,
    });

    const result = JSON.parse(String(response));

    expect(result.success).toBe(false);
    expect(result.reason).toBe("NOT_FOUND");
  });

  it("distingue falha técnica de produto inexistente", async () => {
    vi.mocked(getProductById).mockResolvedValueOnce({
      success: false,
      reason: "EXTERNAL_API_ERROR",
    });

    const response = await consultarProdutoTool.invoke({
      productId: 1,
    });

    const result = JSON.parse(String(response));

    expect(result.success).toBe(false);
    expect(result.reason).toBe("EXTERNAL_API_ERROR");
  });
});
