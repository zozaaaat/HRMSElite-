export interface NotificationPayload {
  to: string;
  message: string;
}

export async function sendEmailNotification(payload: NotificationPayload) {
  console.log(`Sending email to ${payload.to}: ${payload.message}`);
}

export async function sendPushNotification(payload: NotificationPayload) {
  console.log(`Sending push notification to ${payload.to}: ${payload.message}`);
}

export async function sendSmsNotification(payload: NotificationPayload) {
  console.log(`Sending SMS to ${payload.to}: ${payload.message}`);
}

export async function sendInAppNotification(payload: NotificationPayload) {
  console.log(`Sending in-app notification to ${payload.to}: ${payload.message}`);
}

export async function notifyAll(payload: NotificationPayload) {
  await Promise.all([
    sendEmailNotification(payload),
    sendPushNotification(payload),
    sendSmsNotification(payload),
    sendInAppNotification(payload)
  ]);
}
