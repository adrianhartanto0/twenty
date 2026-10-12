import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum PushNotificationExceptionCode {
  WEB_PUSH_NOT_CONFIGURED = 'WEB_PUSH_NOT_CONFIGURED',
  SUBSCRIPTION_NOT_FOUND = 'SUBSCRIPTION_NOT_FOUND',
}

const getPushNotificationExceptionUserFriendlyMessage = (
  code: PushNotificationExceptionCode,
) => {
  switch (code) {
    case PushNotificationExceptionCode.WEB_PUSH_NOT_CONFIGURED:
      return msg`Push notifications are not configured on this server.`;
    case PushNotificationExceptionCode.SUBSCRIPTION_NOT_FOUND:
      return msg`This device is not subscribed to push notifications.`;
    default:
      assertUnreachable(code);
  }
};

export class PushNotificationException extends CustomException<PushNotificationExceptionCode> {
  constructor(
    message: string,
    code: PushNotificationExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getPushNotificationExceptionUserFriendlyMessage(code),
    });
  }
}
