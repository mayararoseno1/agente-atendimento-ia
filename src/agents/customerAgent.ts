
import { createGeminiModel } from "../config/gemini.js";
import { consultarPedidoTool } from "../tools/orderTools.js";
import { consultarProdutoTool } from "../tools/productTools.js";
import { solicitarCancelamentoTool } from "../tools/cancellationRequestTool.js";

export const agentTools = [
  consultarPedidoTool,
  consultarProdutoTool,
  solicitarCancelamentoTool,
];

export function createCustomerAgent() {
  const model = createGeminiModel();

  return model.bindTools(agentTools);
}
