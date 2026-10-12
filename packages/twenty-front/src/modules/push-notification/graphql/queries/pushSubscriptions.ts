import { gql } from '@apollo/client';

export const PUSH_SUBSCRIPTIONS = gql`
  query PushSubscriptions {
    pushSubscriptions {
      id
      endpoint
      userAgent
      createdAt
    }
  }
`;
