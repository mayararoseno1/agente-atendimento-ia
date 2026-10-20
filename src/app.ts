
import express from "express";
import { orderRouter } from "./routes/orderRoutes.js";

export const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "agente-atendimento-ia",
  });
});

app.use("/orders", orderRouter);
