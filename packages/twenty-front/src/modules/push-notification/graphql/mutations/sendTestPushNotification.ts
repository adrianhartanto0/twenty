import { gql } from '@apollo/client';

export const SEND_TEST_PUSH_NOTIFICATION = gql`
  mutation SendTestPushNotification {
    sendTestPushNotification
  }
`;
