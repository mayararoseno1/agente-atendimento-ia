
import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "API de Atendimento com IA",
      version: "1.0.0",
      description:
        "API para consulta e cancelamento de pedidos, utilizada por um agente de atendimento com IA.",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Ambiente de desenvolvimento",
      },
    ],
    components: {
      schemas: {
        Order: {
          type: "object",
          properties: {
            id: { type: "string", example: "ORD-001" },
            status: {
              type: "string",
              enum: ["processing", "shipped", "cancelled"],
            },
            productId: { type: "integer", example: 1 },
            quantity: { type: "integer", example: 1 },
            createdAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        CancellationRequest: {
          type: "object",
          required: ["confirmed", "customerId"],
          properties: {
            confirmed: {
              type: "boolean",
              description: "Confirmação explícita do cancelamento.",
            },
            customerId: {
              type: "string",
              example: "CUS-001",
              description:
                "Identificador demonstrativo; não substitui autenticação.",
            },
          },
        },
      },
    },
    paths: {
      "/orders/{id}": {
        get: {
          summary: "Consultar pedido",
          tags: ["Pedidos"],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              example: "ORD-001",
            },
          ],
          responses: {
            200: {
              description: "Pedido encontrado",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Order",
                  },
                },
              },
            },
            400: { description: "Identificador inválido" },
            404: { description: "Pedido não encontrado" },
          },
        },
      },
      "/orders/{id}/cancel": {
        post: {
          summary: "Cancelar pedido",
          tags: ["Pedidos"],
          description:
            "Cancela somente pedidos em processamento, mediante confirmação. Demonstração sem autenticação real.",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              example: "ORD-001",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CancellationRequest",
                },
              },
            },
          },
          responses: {
            200: { description: "Pedido cancelado com sucesso" },
            400: { description: "Dados inválidos ou confirmação ausente" },
            403: { description: "Identificação do cliente não corresponde" },
            404: { description: "Pedido não encontrado" },
            409: { description: "Pedido não pode ser cancelado" },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
