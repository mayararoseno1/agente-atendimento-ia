import { findOrderById } from "./orderService.js";
import {
  getPendingCancellation,
} from "./cancellationConfirmationService.js";

import {
  createCancellationReminder,
  createCancellationExpired,
  type CancellationNotification,
} from "./cancellationNotificationService.js";

export type NotificationSender = (
  notification: CancellationNotification
) => Promise<void>;

export function scheduleCancellationNotifications(
  customerId: string,
  orderId: string,
  sendNotification: NotificationSender
): void {

  setTimeout(async () => {
    const pending = getPendingCancellation(customerId);

    if (!pending || pending.orderId !== orderId) {
      return;
    }

    await sendNotification(
      createCancellationReminder(customerId, orderId)
    );
  }, 3 * 60 * 1000);

  setTimeout(async () => {
    const pending = getPendingCancellation(customerId);

    if (pending) {
      return;
    }

    const order = findOrderById(orderId);

    if (!order || order.customerId !== customerId) {
      return;
    }

    if (order.status !== "processing") {
      return;
    }

    await sendNotification(
      createCancellationExpired(customerId, orderId)
    );
  }, 5 * 60 * 1000);}