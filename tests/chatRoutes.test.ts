
import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

import { app } from "../src/app.js";
import { processAgentMessage } from "../src/services/agentService.js";

vi.mock("../src/services/agentService.js", () => ({
  processAgentMessage: vi.fn(),
}));

const mockedProcessAgentMessage = vi.mocked(processAgentMessage);

describe("POST /chat", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("rejeita uma mensagem vazia", async () => {
    const response = await request(app)
      .post("/chat")
      .send({
        customerId: "CUS-001",
        message: "",
      });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      reason: "INVALID_ARGUMENTS",
    });

    expect(mockedProcessAgentMessage).not.toHaveBeenCalled();
  });

  it("rejeita uma solicitação sem customerId", async () => {
    const response = await request(app)
      .post("/chat")
      .send({
        message: "Olá!",
      });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      reason: "INVALID_ARGUMENTS",
    });

    expect(mockedProcessAgentMessage).not.toHaveBeenCalled();
  });

  it("retorna a resposta do agente de IA", async () => {
    mockedProcessAgentMessage.mockResolvedValue(
      "O pedido ORD-001 está em processamento."
    );

    const response = await request(app)
      .post("/chat")
      .send({
        customerId: "CUS-001",
        message: "Qual é o status do pedido ORD-001?",
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      reply: "O pedido ORD-001 está em processamento.",
    });

    expect(mockedProcessAgentMessage).toHaveBeenCalledWith(
      "Qual é o status do pedido ORD-001?",
      { customerId: "CUS-001" }
    );
  });

  it("retorna erro controlado quando o agente falha", async () => {
    mockedProcessAgentMessage.mockRejectedValue(
      new Error("Gemini indisponível")
    );

    const response = await request(app)
      .post("/chat")
      .send({
        customerId: "CUS-001",
        message: "Olá!",
      });

    expect(response.status).toBe(503);
    expect(response.body).toMatchObject({
      success: false,
      reason: "AGENT_UNAVAILABLE",
    });
  });
});
