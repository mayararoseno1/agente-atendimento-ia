
import { Router } from "express";
import { z } from "zod";

import { processAgentMessage } from "../services/agentService.js";

export const chatRouter = Router();

const chatMessageSchema = z.object({
  message: z.string().trim().min(1),
  customerId: z.string().trim().min(1),
});

chatRouter.post("/", async (req, res) => {
  const validation = chatMessageSchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({
      success: false,
      reason: "INVALID_ARGUMENTS",
      message: "Informe uma mensagem e um cliente válidos.",
    });
    return;
  }

  const { message, customerId } = validation.data;

try {
  console.log("[CHAT] Iniciando processamento do agente");

  const reply = await processAgentMessage(message, { customerId });

  console.log("[CHAT] Processamento do agente concluído");

  res.status(200).json({ success: true, reply });

  } catch (error) {
  console.error("[CHAT] Falha no processamento:", error);

    const isTimeout =
    error instanceof Error &&
    (error.name === "TimeoutError" ||
    error.name === "AbortError" ||
    /timed out|timeout|aborted/i.test(error.message));

    if (isTimeout) {
    res.status(504).json({
    success: false,
    reason: "AGENT_TIMEOUT",
    message:
      "O atendimento demorou mais que o esperado. Tente novamente ou solicite atendimento humano.",
  });
  return;
}

  res.status(503).json({
      success: false,
      reason: "AGENT_UNAVAILABLE",
      message:
        "O atendimento automático está indisponível no momento. " +
        "Tente novamente ou solicite atendimento humano.",
    });
  }
});
