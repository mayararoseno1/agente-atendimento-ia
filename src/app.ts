
import express from "express";
import pinoHttpModule from "pino-http";
import type { IncomingMessage, ServerResponse } from "node:http";

import { orderRouter } from "./routes/orderRoutes.js";
import { swaggerSpec } from "./config/swagger.js";
import { logger } from "./config/logger.js";

import swaggerUi from "swagger-ui-express";

export const app = express();

// Middleware de logs estruturados
const pinoHttp = pinoHttpModule.default ?? pinoHttpModule;

app.use(
  pinoHttp({
    logger,
    autoLogging: {
      ignore: (req: IncomingMessage) => req.url === "/health",
    },
    serializers: {
      req(req: IncomingMessage) {
        return {
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res: ServerResponse) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  })
);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "agente-atendimento-ia",
  });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/orders", orderRouter);
