
export type CancellationNotificationType =
  | "REMINDER"
  | "EXPIRED";

export interface CancellationNotification {
  type: CancellationNotificationType;
  customerId: string;
  orderId: string;
  message: string;
}

export function createCancellationReminder(
  customerId: string,
  orderId: string
): CancellationNotification {
  return {
    type: "REMINDER",
    customerId,
    orderId,
    message:
      `Oi! 😊 Ainda estou aguardando sua confirmação ` +
      `para cancelar o pedido ${orderId}.\n\n` +
      `Restam aproximadamente 2 minutos para confirmar. ` +
      `Responda SIM para confirmar ou NÃO para manter o pedido.`,
  };
}

export function createCancellationExpired(
  customerId: string,
  orderId: string
): CancellationNotification {
  return {
    type: "EXPIRED",
    customerId,
    orderId,
    message:
      `⏰ O prazo para confirmar o cancelamento ` +
      `do pedido ${orderId} terminou.\n\n` +
      `Como não recebemos sua confirmação, ` +
      `nenhum cancelamento foi realizado.\n\n` +
      `Se ainda deseja cancelar, envie uma nova solicitação ` +
      `para reiniciarmos o processo. 😊`,
  };
}
