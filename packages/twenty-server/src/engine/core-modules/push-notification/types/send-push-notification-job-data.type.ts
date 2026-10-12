import { type PushNotificationPayload } from 'src/engine/core-modules/push-notification/types/push-notification-payload.type';

export type SendPushNotificationJobData = {
  pushSubscriptionId: string;
  payload: PushNotificationPayload;
};
