import { type ApolloClient } from '@apollo/client';
import { isDefined } from 'twenty-shared/utils';

import { UNREGISTER_PUSH_SUBSCRIPTION } from '@/push-notification/graphql/mutations/unregisterPushSubscription';
import { isPushNotificationSupported } from '@/push-notification/utils/isPushNotificationSupported';

const UNREGISTER_TIMEOUT_MS = 3000;

const unregister = async (apolloClient: ApolloClient) => {
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();

  if (!isDefined(subscription)) {
    return;
  }

  // The server row goes first because the mutation needs the auth token that
  // sign-out is about to clear
  await apolloClient.mutate({
    mutation: UNREGISTER_PUSH_SUBSCRIPTION,
    variables: { input: { endpoint: subscription.endpoint } },
  });
  await subscription.unsubscribe();
};

export const unregisterCurrentPushSubscription = async (
  apolloClient: ApolloClient,
): Promise<void> => {
  if (!isPushNotificationSupported()) {
    return;
  }

  try {
    await Promise.race([
      unregister(apolloClient),
      new Promise((resolve) => setTimeout(resolve, UNREGISTER_TIMEOUT_MS)),
    ]);
  } catch {
    // Sign-out must never be blocked by push cleanup
  }
};
