import { gql } from '@apollo/client';

export const REGISTER_PUSH_SUBSCRIPTION = gql`
  mutation RegisterPushSubscription($input: RegisterPushSubscriptionInput!) {
    registerPushSubscription(input: $input) {
      id
      endpoint
    }
  }
`;
