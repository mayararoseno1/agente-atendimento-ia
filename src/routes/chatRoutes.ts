
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
    const reply = await processAgentMessage(message, {
      customerId,
    });

    res.status(200).json({
      success: true,
      reply,
    });
  } catch {
    res.status(503).json({
      success: false,
      reason: "AGENT_UNAVAILABLE",
      message:
        "O atendimento automático está indisponível no momento. " +
        "Tente novamente ou solicite atendimento humano.",
    });
  }
});
