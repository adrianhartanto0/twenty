import { usePushNotificationSubscription } from '@/push-notification/hooks/usePushNotificationSubscription';

export const PushNotificationSubscribeOnSignInEffect = () => {
  usePushNotificationSubscription({ shouldSubscribeWhenGranted: true });

  return null;
};
