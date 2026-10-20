
import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { app } from "../src/app.js";

describe("API de produtos", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("GET /products/1 retorna produto existente", async () => {
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

    const response = await request(app).get("/products/1");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(product);
  });

  it("GET /products/abc retorna 400", async () => {
    const response = await request(app).get("/products/abc");

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("INVALID_PRODUCT_ID");
  });

  it("GET /products/999 retorna 404 quando não encontrado", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      })
    );

    const response = await request(app).get("/products/999");

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("PRODUCT_NOT_FOUND");
  });

  it("GET /products/1 retorna 502 quando a API externa falha", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network error"))
    );

    const response = await request(app).get("/products/1");

    expect(response.status).toBe(502);
    expect(response.body.error).toBe("EXTERNAL_API_ERROR");
  });

  it("GET /products/0 retorna 400", async () => {
    const response = await request(app).get("/products/0");

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("INVALID_PRODUCT_ID");
  });
});
