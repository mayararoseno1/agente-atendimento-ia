
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { app } from "../src/app.js";
import { orders } from "../src/data/orders.js";

describe("API de pedidos", () => {
  beforeEach(() => {
    orders[0].status = "processing";
    orders[1].status = "shipped";
    orders[2].status = "cancelled";
  });

  describe("GET /orders/:id", () => {
    it("retorna 200 para pedido existente", async () => {
      const response = await request(app).get("/orders/ORD-001");

      expect(response.status).toBe(200);
      expect(response.body.id).toBe("ORD-001");
      expect(response.body.status).toBe("processing");
      expect(response.body).not.toHaveProperty("customerId");
    });

    it("retorna 404 para pedido inexistente", async () => {
      const response = await request(app).get("/orders/ORD-999");

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("ORDER_NOT_FOUND");
    });

    it("retorna 400 para identificador inválido", async () => {
      const response = await request(app).get("/orders/abc");

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("INVALID_ORDER_ID");
    });
  });

  describe("POST /orders/:id/cancel", () => {
    it("cancela pedido em processamento", async () => {
      const response = await request(app)
        .post("/orders/ORD-001/cancel")
        .send({
          confirmed: true,
          customerId: "CUS-001",
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("cancelled");
      expect(orders[0].status).toBe("cancelled");
    });

    it("bloqueia cancelamento de pedido enviado", async () => {
      const response = await request(app)
        .post("/orders/ORD-002/cancel")
        .send({
          confirmed: true,
          customerId: "CUS-002",
        });

      expect(response.status).toBe(409);
      expect(orders[1].status).toBe("shipped");
    });

    it("exige confirmação explícita", async () => {
      const response = await request(app)
        .post("/orders/ORD-001/cancel")
        .send({
          confirmed: false,
          customerId: "CUS-001",
        });

      expect(response.status).toBe(400);
      expect(orders[0].status).toBe("processing");
    });

    it("bloqueia cliente com identificador diferente", async () => {
      const response = await request(app)
        .post("/orders/ORD-001/cancel")
        .send({
          confirmed: true,
          customerId: "CUS-999",
        });

      expect(response.status).toBe(403);
      expect(orders[0].status).toBe("processing");
    });

    it("retorna 404 ao cancelar pedido inexistente", async () => {
      const response = await request(app)
        .post("/orders/ORD-999/cancel")
        .send({
          confirmed: true,
          customerId: "CUS-001",
        });

      expect(response.status).toBe(404);
    });

    it("impede cancelar pedido já cancelado", async () => {
      const response = await request(app)
        .post("/orders/ORD-003/cancel")
        .send({
          confirmed: true,
          customerId: "CUS-003",
        });

      expect(response.status).toBe(409);
    });
  });
});
