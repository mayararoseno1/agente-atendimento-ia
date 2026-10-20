
import { afterEach, describe, expect, it, vi } from "vitest";
import { getProductById } from "../src/services/productService.js";

describe("Serviço de produtos - Fake Store API", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("retorna um produto quando a API responde corretamente", async () => {
    const product = {
      id: 1,
      title: "Mochila",
      price: 109.95,
      description: "Mochila para notebook",
      category: "acessórios",
      image: "https://example.com/mochila.png",
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => product,
      })
    );

    const result = await getProductById(1);

    expect(result).toEqual({
      success: true,
      product,
    });
  });

  it("retorna NOT_FOUND quando o produto não existe", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      })
    );

    const result = await getProductById(999);

    expect(result).toEqual({
      success: false,
      reason: "NOT_FOUND",
    });
  });

  it("retorna EXTERNAL_API_ERROR quando a API falha", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      })
    );

    const result = await getProductById(1);

    expect(result).toEqual({
      success: false,
      reason: "EXTERNAL_API_ERROR",
    });
  });

  it("retorna EXTERNAL_API_ERROR quando ocorre erro de conexão", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network error"))
    );

    const result = await getProductById(1);

    expect(result).toEqual({
      success: false,
      reason: "EXTERNAL_API_ERROR",
    });
  });

  it("rejeita dados inválidos retornados pela API", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          id: 1,
          title: "Produto incompleto",
        }),
      })
    );

    const result = await getProductById(1);

    expect(result).toEqual({
      success: false,
      reason: "EXTERNAL_API_ERROR",
    });
  });

  it("rejeita produto com ID diferente do solicitado", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          id: 2,
          title: "Outro produto",
          price: 50,
          description: "Descrição",
          category: "acessórios",
          image: "https://example.com/produto.png",
        }),
      })
    );

    const result = await getProductById(1);

    expect(result).toEqual({
      success: false,
      reason: "EXTERNAL_API_ERROR",
    });
  });
});
