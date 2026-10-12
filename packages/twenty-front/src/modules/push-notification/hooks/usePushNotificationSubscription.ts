import { webPushState } from '@/client-config/states/webPushState';
import { REGISTER_PUSH_SUBSCRIPTION } from '@/push-notification/graphql/mutations/registerPushSubscription';
import { SEND_TEST_PUSH_NOTIFICATION } from '@/push-notification/graphql/mutations/sendTestPushNotification';
import { UNREGISTER_PUSH_SUBSCRIPTION } from '@/push-notification/graphql/mutations/unregisterPushSubscription';
import { getPushServiceWorkerRegistration } from '@/push-notification/utils/getPushServiceWorkerRegistration';
import { isPushNotificationSupported } from '@/push-notification/utils/isPushNotificationSupported';
import { urlBase64ToUint8Array } from '@/push-notification/utils/urlBase64ToUint8Array';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMutation } from '@apollo/client/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

type RegisterPushSubscriptionVariables = {
  input: {
    endpoint: string;
    keys: { p256dh: string; auth: string };
    userAgent?: string;
    expirationTime?: Date;
  };
};

type UnregisterPushSubscriptionVariables = {
  input: { endpoint: string };
};

type SendTestPushNotificationResult = {
  sendTestPushNotification: number;
};

type UsePushNotificationSubscriptionOptions = {
  shouldSubscribeWhenGranted?: boolean;
};

export const usePushNotificationSubscription = ({
  shouldSubscribeWhenGranted = false,
}: UsePushNotificationSubscriptionOptions = {}) => {
  const webPush = useAtomStateValue(webPushState);
  const vapidPublicKey = webPush?.vapidPublicKey;

  const isSupported = isPushNotificationSupported();
  const isEnabledOnServer = isNonEmptyString(vapidPublicKey);

  const [browserSubscription, setBrowserSubscription] =
    useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [registerPushSubscription] = useMutation<
    unknown,
    RegisterPushSubscriptionVariables
  >(REGISTER_PUSH_SUBSCRIPTION);
  const [unregisterPushSubscription] = useMutation<
    unknown,
    UnregisterPushSubscriptionVariables
  >(UNREGISTER_PUSH_SUBSCRIPTION);
  const [sendTestPushNotification] =
    useMutation<SendTestPushNotificationResult>(SEND_TEST_PUSH_NOTIFICATION);

  const createSubscription = async (
    registration: ServiceWorkerRegistration,
    applicationServerKey: string,
  ): Promise<PushSubscription> => {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(applicationServerKey),
    });

    const { endpoint, keys, expirationTime } = subscription.toJSON();

    if (!isDefined(endpoint) || !isDefined(keys)) {
      throw new Error('Browser returned an incomplete push subscription');
    }

    await registerPushSubscription({
      variables: {
        input: {
          endpoint,
          keys: { p256dh: keys.p256dh, auth: keys.auth },
          userAgent: navigator.userAgent,
          expirationTime: isDefined(expirationTime)
            ? new Date(expirationTime)
            : undefined,
        },
      },
    });

    return subscription;
  };

  // The browser is released first so a failure leaves nothing half-removed;
  // a stale server row is cleaned up by the sender on the next 404/410
  const removeSubscription = async (subscription: PushSubscription) => {
    const { endpoint } = subscription;

    await subscription.unsubscribe();
    await unregisterPushSubscription({ variables: { input: { endpoint } } });
  };

  // A browser subscription is shared by every account signed in on this
  // browser, so an existing one may belong to a previous user. It is replaced
  // with a fresh subscription bound to the current user. When asked to, a
  // device whose permission was already granted is subscribed even if it has
  // no subscription yet, which needs no user gesture.
  useEffect(() => {
    if (!isSupported || !isNonEmptyString(vapidPublicKey)) {
      return;
    }

    let isCancelled = false;

    const syncSubscriptionWithCurrentUser = async () => {
      const existingRegistration =
        await navigator.serviceWorker.getRegistration();
      const existingSubscription =
        await existingRegistration?.pushManager.getSubscription();

      if (
        Notification.permission !== 'granted' ||
        (!isDefined(existingSubscription) && !shouldSubscribeWhenGranted)
      ) {
        if (!isCancelled) {
          setBrowserSubscription(null);
        }
        return;
      }

      setIsLoading(true);

      try {
        if (isDefined(existingSubscription)) {
          await removeSubscription(existingSubscription);
        }

        const registration = await getPushServiceWorkerRegistration();
        const subscription = await createSubscription(
          registration,
          vapidPublicKey,
        );

        if (!isCancelled) {
          setBrowserSubscription(subscription);
        }
      } catch {
        if (!isCancelled) {
          setBrowserSubscription(null);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    syncSubscriptionWithCurrentUser();

    return () => {
      isCancelled = true;
    };
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupported, vapidPublicKey, shouldSubscribeWhenGranted]);

  const subscribe = async () => {
    if (!isSupported || !isNonEmptyString(vapidPublicKey)) {
      return;
    }

    setIsLoading(true);

    try {
      // Must be called from a user gesture or the browser will not prompt
      const permission = await Notification.requestPermission();

      if (permission !== 'granted') {
        return;
      }

      const registration = await getPushServiceWorkerRegistration();
      const subscription = await createSubscription(
        registration,
        vapidPublicKey,
      );

      setBrowserSubscription(subscription);
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async () => {
    if (!isDefined(browserSubscription)) {
      return;
    }

    setIsLoading(true);

    try {
      await removeSubscription(browserSubscription);
      setBrowserSubscription(null);
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestNotification = async (): Promise<number> => {
    const { data } = await sendTestPushNotification();

    return data?.sendTestPushNotification ?? 0;
  };

  return {
    isSupported,
    isEnabledOnServer,
    isSubscribed: isDefined(browserSubscription),
    isPermissionDenied: isSupported && Notification.permission === 'denied',
    isLoading,
    subscribe,
    unsubscribe,
    sendTestNotification,
  };
};
