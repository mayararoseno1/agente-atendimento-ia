
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AIMessage } from "@langchain/core/messages";

const { invokeMock, executeToolMock } = vi.hoisted(() => ({
  invokeMock: vi.fn(),
  executeToolMock: vi.fn(),
}));

vi.mock("../src/agents/customerAgent.js", () => ({
  createCustomerAgent: () => ({
    invoke: invokeMock,
  }),
}));

vi.mock("../src/agents/toolExecutor.js", () => ({
  executeTool: executeToolMock,
}));

import { processAgentMessage } from "../src/services/agentService.js";

describe("Serviço do agente", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("responde sem executar ferramentas quando não são necessárias", async () => {
    invokeMock.mockResolvedValue(
      new AIMessage("Olá! Como posso ajudar?")
    );

    const response = await processAgentMessage(
      "Olá!",
      { customerId: "CUS-001" }
    );

    expect(response).toBe("Olá! Como posso ajudar?");
    expect(invokeMock).toHaveBeenCalledTimes(1);
    expect(executeToolMock).not.toHaveBeenCalled();
  });

  it("executa uma ferramenta e retorna a resposta final", async () => {
    invokeMock
      .mockResolvedValueOnce(
        new AIMessage({
          content: "",
          tool_calls: [
            {
              id: "call_001",
              name: "consultar_pedido",
              args: { orderId: "ORD-001" },
            },
          ],
        })
      )
      .mockResolvedValueOnce(
        new AIMessage("Seu pedido ORD-001 está em processamento.")
      );

    executeToolMock.mockResolvedValue(
      JSON.stringify({
        success: true,
        order: {
          id: "ORD-001",
          status: "processing",
        },
      })
    );

    const response = await processAgentMessage(
      "Qual é o status do pedido ORD-001?",
      { customerId: "CUS-001" }
    );

    expect(response).toBe(
      "Seu pedido ORD-001 está em processamento."
    );

    expect(executeToolMock).toHaveBeenCalledWith(
      "consultar_pedido",
      { orderId: "ORD-001" },
      { customerId: "CUS-001" }
    );

    expect(invokeMock).toHaveBeenCalledTimes(2);
  });
it("interrompe a execução ao atingir o limite de ferramentas", async () => {
  for (let i = 0; i < 4; i++) {
    invokeMock.mockResolvedValueOnce(
      new AIMessage({
        content: "",
        tool_calls: [
          {
            id: `call_${i}`,
            name: "consultar_pedido",
            args: { orderId: "ORD-001" },
          },
        ],
      })
    );
  }

  executeToolMock.mockResolvedValue(
    JSON.stringify({
      success: true,
      order: {
        id: "ORD-001",
        status: "processing",
      },
    })
  );

  const response = await processAgentMessage(
    "Consulte meu pedido ORD-001.",
    { customerId: "CUS-001" }
  );

  expect(response).toContain("atendimento humano");

  expect(invokeMock).toHaveBeenCalledTimes(4);

  expect(executeToolMock).toHaveBeenCalledTimes(3);
});

it("oferece atendimento humano quando o Gemini gera uma chamada inválida", async () => {
  invokeMock.mockResolvedValue(
    new AIMessage({
      content: "",
      invalid_tool_calls: [
        {
          id: "call_invalid",
          name: "consultar_pedido",
          args: "{orderId:",
          error: "Argumentos inválidos",
        },
      ],
    })
  );

  const response = await processAgentMessage(
    "Consulte meu pedido.",
    { customerId: "CUS-001" }
  );

  expect(response).toContain("atendimento humano");
  expect(invokeMock).toHaveBeenCalledTimes(1);
  expect(executeToolMock).not.toHaveBeenCalled();
});

it("repassa o erro da ferramenta ao Gemini para gerar a resposta", async () => {
  invokeMock
    .mockResolvedValueOnce(
      new AIMessage({
        content: "",
        tool_calls: [
          {
            id: "call_not_found",
            name: "consultar_pedido",
            args: { orderId: "ORD-999" },
          },
        ],
      })
    )
    .mockResolvedValueOnce(
      new AIMessage(
        "Não encontrei esse pedido. Posso encaminhar você ao atendimento humano."
      )
    );

  executeToolMock.mockResolvedValue(
    JSON.stringify({
      success: false,
      reason: "ORDER_NOT_FOUND",
      message: "Pedido não encontrado.",
    })
  );

  const response = await processAgentMessage(
    "Onde está meu pedido ORD-999?",
    { customerId: "CUS-001" }
  );

  expect(response).toContain("Não encontrei esse pedido");
  expect(executeToolMock).toHaveBeenCalledTimes(1);

  const secondCallMessages = invokeMock.mock.calls[1][0];

  expect(
    secondCallMessages.some(
      (message: { content: unknown }) =>
        typeof message.content === "string" &&
        message.content.includes("ORDER_NOT_FOUND")
    )
  ).toBe(true);
});
});
