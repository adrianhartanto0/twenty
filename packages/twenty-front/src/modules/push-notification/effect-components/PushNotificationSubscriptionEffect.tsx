import { currentUserState } from '@/auth/states/currentUserState';
import { usePushNotificationSubscription } from '@/push-notification/hooks/usePushNotificationSubscription';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
// import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { OnboardingStatus } from '~/generated-metadata/graphql';

export const PushNotificationSubscriptionEffect = () => {
  const currentUser = useAtomStateValue(currentUserState);

  usePushNotificationSubscription({
    shouldSubscribeWhenGranted:
      isDefined(currentUser) &&
      currentUser.onboardingStatus === OnboardingStatus.COMPLETED,
  });

  // const { isSupported, isEnabledOnServer, isSubscribed, subscribe } =
  //   usePushNotificationSubscription();
  //
  // const isReady =
  //   isDefined(currentUser) &&
  //   currentUser.onboardingStatus === OnboardingStatus.COMPLETED &&
  //   isSupported &&
  //   isEnabledOnServer;
  //
  // useEffect(() => {
  //   if (!isReady || isSubscribed) {
  //     return;
  //   }
  //
  //   setTimeout(() => {
  //     if (Notification.permission !== 'granted') {
  //       subscribe();
  //       return;
  //     }
  //   }, 2000)
  //
  // }, [isReady, isSubscribed]);

  return null;
};
