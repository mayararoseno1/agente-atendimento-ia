
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { createCustomerAgent } from "../agents/customerAgent.js";

async function main() {
  const agent = createCustomerAgent();

  const response = await agent.invoke([
    new SystemMessage(
      "Você é um assistente de atendimento de uma loja. " +
      "Utilize as ferramentas disponíveis quando precisar consultar " +
      "informações sobre pedidos ou produtos. " +
      "Não invente informações e não afirme que executou ações " +
      "sem confirmação do backend."
    ),

    new HumanMessage(
  "Qual é o status do pedido ORD-001?"),
  ]);

  console.log("Resposta textual:", response.text);
  console.log(
    "Ferramentas solicitadas:",
    JSON.stringify(response.tool_calls ?? [], null, 2)
  );
}

main().catch((error) => {
  console.error("Falha na chamada ao Gemini:", error.message);
  process.exitCode = 1;
});
