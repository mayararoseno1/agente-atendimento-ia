
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { AIMessage } from "@langchain/core/messages";

const { invokeMock } = vi.hoisted(() => ({
  invokeMock: vi.fn(),
}));

vi.mock("../src/config/gemini.js", () => ({
  createGeminiModel: () => ({
    invoke: invokeMock,
  }),
}));

import { classifyCancellationIntent } from "../src/services/cancellationIntentService.js";

describe("Classificação de intenção de cancelamento", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reconhece confirmação explícita", async () => {
    invokeMock.mockResolvedValue(
      new AIMessage("CONFIRM")
    );

    const result = await classifyCancellationIntent(
      "Claro, pode cancelar meu pedido!",
      "ORD-001"
    );

    expect(result).toBe("CONFIRM");
    expect(invokeMock).toHaveBeenCalledTimes(1);
  });

  it("reconhece recusa de cancelamento", async () => {
    invokeMock.mockResolvedValue(
      new AIMessage("DENY")
    );

    const result = await classifyCancellationIntent(
      "Pensando melhor, quero manter o pedido.",
      "ORD-001"
    );

    expect(result).toBe("DENY");
  });

  it("mantém respostas ambíguas como UNCLEAR", async () => {
    invokeMock.mockResolvedValue(
      new AIMessage("UNCLEAR")
    );

    const result = await classifyCancellationIntent(
      "Talvez eu cancele depois.",
      "ORD-001"
    );

    expect(result).toBe("UNCLEAR");
  });

  it("não aceita classificação fora das opções permitidas", async () => {
    invokeMock.mockResolvedValue(
      new AIMessage("Pedido cancelado com sucesso!")
    );

    const result = await classifyCancellationIntent(
      "Pode cancelar?",
      "ORD-001"
    );

    expect(result).toBe("UNCLEAR");
  });

  it("não autoriza confirmação quando o Gemini falha", async () => {
    invokeMock.mockRejectedValue(
      new Error("Gemini indisponível")
    );

    const result = await classifyCancellationIntent(
      "Pode cancelar meu pedido",
      "ORD-001"
    );

    expect(result).toBe("UNCLEAR");
  });

  it("não aceita respostas estruturadas inesperadas", async () => {
    invokeMock.mockResolvedValue(
      new AIMessage({
        content: [
          { type: "text", text: "CONFIRM" },
        ],
      })
    );

    const result = await classifyCancellationIntent(
      "Pode cancelar",
      "ORD-001"
    );

    expect(result).toBe("UNCLEAR");
  });
});
