
import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const solicitarCancelamentoTool = tool(
  async () => {
    return "A solicitação deve ser processada pelo backend.";
  },
  {
    name: "solicitar_cancelamento",
    description:
      "Inicia uma solicitação de cancelamento de pedido. Não cancela o pedido. O cliente precisa confirmar explicitamente em uma nova mensagem.",
    schema: z.object({
      orderId: z
        .string()
        .describe("Identificador do pedido, por exemplo ORD-001."),
    }),
  }
);
