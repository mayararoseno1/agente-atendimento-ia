
import "dotenv/config";
import { processAgentMessage } from "../services/agentService.js";

async function main() {
  const response = await processAgentMessage(
    "Qual é o status do meu pedido ORD-001?",
    {
      customerId: "CUS-001",
    }
  );

  console.log("Resposta do agente:");
  console.log(response);
}

main().catch((error) => {
  console.error("Erro ao executar o agente:", error.message);
  process.exitCode = 1;
});
