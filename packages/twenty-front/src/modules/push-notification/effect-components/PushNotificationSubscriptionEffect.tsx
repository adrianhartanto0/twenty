import { currentUserState } from '@/auth/states/currentUserState';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { usePushNotificationSubscription } from '@/push-notification/hooks/usePushNotificationSubscription';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { OnboardingStatus } from '~/generated-metadata/graphql';

export const PushNotificationSubscriptionEffect = () => {
  const tokenPair = useAtomStateValue(tokenPairState);
  const currentUser = useAtomStateValue(currentUserState);

  // The token pair is restored from local storage on startup and sign-out
  // reloads the page, so an empty token pair at mount means the user signs in
  // during this page's lifetime rather than returning with a saved session
  const [isSigningInDuringPageLifetime] = useState(() => !isDefined(tokenPair));

  const { isSupported, isEnabledOnServer, isSubscribed, subscribe } =
    usePushNotificationSubscription();

  const isReady =
    isDefined(currentUser) &&
    currentUser.onboardingStatus === OnboardingStatus.COMPLETED &&
    isSupported &&
    isEnabledOnServer;

  useEffect(() => {
    if (!isReady || isSubscribed) {
      return;
    }

    setTimeout(() => {
      if (Notification.permission !== 'granted') {
        subscribe();
        return;
      }
    }, 2000)

  }, [isReady, isSubscribed]);

  return null
};
