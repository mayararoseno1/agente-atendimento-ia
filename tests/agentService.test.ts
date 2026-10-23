
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { AIMessage } from "@langchain/core/messages";
import {
  requestCancellation,
  getPendingCancellation,
  clearPendingCancellation,
} from "../src/services/cancellationConfirmationService.js";

import { orders } from "../src/data/orders.js";
import { processAgentMessage } from "../src/services/agentService.js";


const {
  invokeMock,
  executeToolMock,
  classifyIntentMock,
} = vi.hoisted(() => ({
  invokeMock: vi.fn(),
  executeToolMock: vi.fn(),
  classifyIntentMock: vi.fn(),
}));

vi.mock("../src/agents/customerAgent.js", () => ({
  createCustomerAgent: () => ({
    invoke: invokeMock,
  }),
}));

vi.mock("../src/agents/toolExecutor.js", () => ({
  executeTool: executeToolMock,
}));

vi.mock("../src/services/cancellationIntentService.js", () => ({
  classifyCancellationIntent: classifyIntentMock,
}));


describe("Serviço do agente", () => {

beforeEach(() => {
  vi.resetAllMocks();

  classifyIntentMock.mockResolvedValue("UNCLEAR");

  clearPendingCancellation("CUS-001");
});


  afterEach(() => {
    clearPendingCancellation("CUS-001");

    const order = orders.find(
      (item) => item.id === "ORD-001"
    );

    if (order) {
      order.status = "processing";
    }
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
        new AIMessage(
          "Seu pedido ORD-001 está em processamento."
        )
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

    expect(response).toContain(
      "Não encontrei esse pedido"
    );

    expect(executeToolMock).toHaveBeenCalledTimes(1);

    const secondCallMessages =
      invokeMock.mock.calls[1][0];

    expect(
      secondCallMessages.some(
        (message: { content: unknown }) =>
          typeof message.content === "string" &&
          message.content.includes("ORDER_NOT_FOUND")
      )
    ).toBe(true);
  });

  it("compartilha o mesmo sinal de timeout entre as rodadas", async () => {
    invokeMock
      .mockResolvedValueOnce(
        new AIMessage({
          content: "",
          tool_calls: [
            {
              id: "call_timeout",
              name: "consultar_pedido",
              args: { orderId: "ORD-001" },
            },
          ],
        })
      )
      .mockResolvedValueOnce(
        new AIMessage(
          "Seu pedido está em processamento."
        )
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

    await processAgentMessage(
      "Qual é o status do pedido ORD-001?",
      { customerId: "CUS-001" }
    );

    expect(invokeMock).toHaveBeenCalledTimes(2);

    const firstSignal =
      invokeMock.mock.calls[0][1]?.signal;

    const secondSignal =
      invokeMock.mock.calls[1][1]?.signal;

    expect(firstSignal).toBeInstanceOf(AbortSignal);
    expect(secondSignal).toBe(firstSignal);
  });

  it("cancela o pedido após confirmação explícita sem chamar o Gemini", async () => {
    const order = orders.find(
      (item) => item.id === "ORD-001"
    );

    expect(order).toBeDefined();

    if (!order) {
      throw new Error("Pedido de teste não encontrado.");
    }

    order.status = "processing";

    const request = requestCancellation(
      "CUS-001",
      "ORD-001"
    );

    expect(request).toEqual({
      success: true,
      orderId: "ORD-001",
    });

    expect(order.status).toBe("processing");

    const response = await processAgentMessage(
      "Sim, confirmo",
      { customerId: "CUS-001" }
    );

    expect(response).toBe(
      "O pedido ORD-001 foi cancelado com sucesso."
    );

    expect(order.status).toBe("cancelled");

    expect(invokeMock).not.toHaveBeenCalled();
    expect(executeToolMock).not.toHaveBeenCalled();
  });

  it("mantém o pedido ativo quando o cliente recusa o cancelamento", async () => {
    const order = orders.find(
      (item) => item.id === "ORD-001"
    );

    expect(order).toBeDefined();

    if (!order) {
      throw new Error("Pedido de teste não encontrado.");
    }

    order.status = "processing";

    const request = requestCancellation(
      "CUS-001",
      "ORD-001"
    );

    expect(request.success).toBe(true);

    const response = await processAgentMessage(
      "Não",
      { customerId: "CUS-001" }
    );

    expect(order.status).toBe("processing");
    expect(response).toContain("descartada");

    expect(invokeMock).not.toHaveBeenCalled();
    expect(executeToolMock).not.toHaveBeenCalled();
  });

  it("não cancela o pedido quando a resposta do cliente é ambígua", async () => {
    const order = orders.find(
      (item) => item.id === "ORD-001"
    );

    expect(order).toBeDefined();

    if (!order) {
      throw new Error("Pedido de teste não encontrado.");
    }

    order.status = "processing";

    const request = requestCancellation(
      "CUS-001",
      "ORD-001"
    );

    expect(request.success).toBe(true);

    const response = await processAgentMessage(
      "Talvez",
      { customerId: "CUS-001" }
    );

    expect(order.status).toBe("processing");

    expect(response).toContain(
      "Você confirma o cancelamento?"
    );

    expect(invokeMock).not.toHaveBeenCalled();
    expect(executeToolMock).not.toHaveBeenCalled();
  });


it("cancela o pedido quando o cliente responde Sim a uma confirmação pendente", async () => {
  const order = orders.find(
    (item) => item.id === "ORD-001"
  );

  expect(order).toBeDefined();

  if (!order) {
    throw new Error("Pedido de teste não encontrado.");
  }

  order.status = "processing";

  const request = requestCancellation(
    "CUS-001",
    "ORD-001"
  );

  expect(request.success).toBe(true);

  const response = await processAgentMessage(
    "Sim",
    { customerId: "CUS-001" }
  );

  // O backend autoriza o cancelamento após confirmação.
  expect(order.status).toBe("cancelled");

  // A resposta deve refletir o resultado real da operação.
  expect(response).toContain(
    "O pedido ORD-001 foi cancelado com sucesso."
  );

  // A confirmação é consumida após o cancelamento.
  expect(
    getPendingCancellation("CUS-001")
  ).toBeUndefined();

  // Respostas simples não precisam de classificação pelo Gemini.
  expect(invokeMock).not.toHaveBeenCalled();
  expect(executeToolMock).not.toHaveBeenCalled();
});

it("não cancela o pedido pendente quando o cliente menciona outro pedido", async () => {
  const order = orders.find(
    (item) => item.id === "ORD-001"
  );

  expect(order).toBeDefined();

  if (!order) {
    throw new Error("Pedido de teste não encontrado.");
  }

  order.status = "processing";

  const request = requestCancellation(
    "CUS-001",
    "ORD-001"
  );

  expect(request.success).toBe(true);

  const response = await processAgentMessage(
    "Sim, mas quero cancelar o ORD-002",
    { customerId: "CUS-001" }
  );

  expect(order.status).toBe("processing");

  expect(response).toContain(
    "Você mencionou outro pedido"
  );

  expect(
    getPendingCancellation("CUS-001")?.orderId
  ).toBe("ORD-001");

  expect(invokeMock).not.toHaveBeenCalled();
  expect(executeToolMock).not.toHaveBeenCalled();
});

it("não cancela quando o Gemini interpreta incorretamente uma mensagem contraditória", async () => {
  const order = orders.find(
    (item) => item.id === "ORD-001"
  );

  if (!order) {
    throw new Error("Pedido de teste não encontrado.");
  }

  order.status = "processing";

  const request = requestCancellation(
    "CUS-001",
    "ORD-001"
  );

  expect(request.success).toBe(true);

  // Simula uma interpretação incorreta do Gemini.
  classifyIntentMock.mockResolvedValue("CONFIRM");

  const response = await processAgentMessage(
    "Sim, mas não quero cancelar o pedido.",
    { customerId: "CUS-001" }
  );

  // O backend deve impedir o cancelamento.
  expect(order.status).toBe("processing");

  // A confirmação pendente deve permanecer disponível.
  expect(
    getPendingCancellation("CUS-001")?.orderId
  ).toBe("ORD-001");

  expect(response).toContain(
    "Você confirma o cancelamento?"
  );

  
expect(classifyIntentMock).not.toHaveBeenCalled();
});

it("não cancela quando a confirmação depende de uma condição", async () => {
  const order = orders.find(
    (item) => item.id === "ORD-001"
  );

  if (!order) {
    throw new Error("Pedido de teste não encontrado.");
  }

  order.status = "processing";

  const request = requestCancellation(
    "CUS-001",
    "ORD-001"
  );

  expect(request.success).toBe(true);

  // Simula o Gemini interpretando a mensagem como confirmação.
  classifyIntentMock.mockResolvedValue("CONFIRM");

  const response = await processAgentMessage(
    "Sim, pode cancelar se chegar amanhã.",
    { customerId: "CUS-001" }
  );

  expect(order.status).toBe("processing");

  expect(
    getPendingCancellation("CUS-001")?.orderId
  ).toBe("ORD-001");

  expect(response).toContain(
    "Você confirma o cancelamento?"
  );

  // O backend identifica a condição antes de consultar a IA.
  expect(classifyIntentMock).not.toHaveBeenCalled();
});

});
