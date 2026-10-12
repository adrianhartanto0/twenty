export type PushNotificationPayload = {
  title: string;
  body?: string;
  // Path or absolute URL opened when the user clicks the notification
  url?: string;
  // Notifications sharing a tag replace each other instead of stacking
  tag?: string;
};
