import { gql } from '@apollo/client';

export const UNREGISTER_PUSH_SUBSCRIPTION = gql`
  mutation UnregisterPushSubscription(
    $input: UnregisterPushSubscriptionInput!
  ) {
    unregisterPushSubscription(input: $input)
  }
`;
