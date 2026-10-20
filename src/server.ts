
import express from "express";
import { orderRouter } from "./routes/orderRoutes.js";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "agente-atendimento-ia",
  });
});

app.use("/orders", orderRouter);

app.listen(PORT, () => {
  console.log(`Servidor iniciado na porta ${PORT}`);
});
