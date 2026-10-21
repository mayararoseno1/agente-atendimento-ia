
import { describe, expect, it } from "vitest";

import {
  createCancellationReminder,
  createCancellationExpired,
} from "../src/services/cancellationNotificationService.js";

describe("Notificações de cancelamento", () => {
  it("cria o lembrete com o pedido correto", () => {
    const notification = createCancellationReminder(
      "CUS-001",
      "ORD-001"
    );

    expect(notification.type).toBe("REMINDER");
    expect(notification.customerId).toBe("CUS-001");
    expect(notification.orderId).toBe("ORD-001");

    expect(notification.message).toContain("ORD-001");
    expect(notification.message).toContain("2 minutos");
    expect(notification.message).toContain("SIM");
    expect(notification.message).toContain("NÃO");
  });

  it("cria a mensagem de expiração", () => {
    const notification = createCancellationExpired(
      "CUS-001",
      "ORD-001"
    );

    expect(notification.type).toBe("EXPIRED");
    expect(notification.customerId).toBe("CUS-001");
    expect(notification.orderId).toBe("ORD-001");

    expect(notification.message).toContain("ORD-001");
    expect(notification.message).toContain(
      "nenhum cancelamento foi realizado"
    );
    expect(notification.message).toContain(
      "nova solicitação"
    );
  });
});
