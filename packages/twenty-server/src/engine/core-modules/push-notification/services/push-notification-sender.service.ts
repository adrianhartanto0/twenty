import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import webPush, { WebPushError } from 'web-push';

import {
  PushNotificationException,
  PushNotificationExceptionCode,
} from 'src/engine/core-modules/push-notification/push-notification.exception';
import { type PushSubscriptionEntity } from 'src/engine/core-modules/push-notification/push-subscription.entity';
import { PushSubscriptionService } from 'src/engine/core-modules/push-notification/services/push-subscription.service';
import { type PushNotificationPayload } from 'src/engine/core-modules/push-notification/types/push-notification-payload.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

// Push services return these when a subscription was revoked by the browser
const GONE_STATUS_CODES = [404, 410];

@Injectable()
export class PushNotificationSenderService {
  private readonly logger = new Logger(PushNotificationSenderService.name);

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly pushSubscriptionService: PushSubscriptionService,
  ) {}

  isConfigured(): boolean {
    return (
      isNonEmptyString(this.twentyConfigService.get('WEB_PUSH_VAPID_PUBLIC_KEY')) &&
      isNonEmptyString(this.twentyConfigService.get('WEB_PUSH_VAPID_PRIVATE_KEY'))
    );
  }

  getVapidPublicKey(): string | undefined {
    return this.isConfigured()
      ? this.twentyConfigService.get('WEB_PUSH_VAPID_PUBLIC_KEY')
      : undefined;
  }

  async send(
    subscription: PushSubscriptionEntity,
    payload: PushNotificationPayload,
  ): Promise<void> {
    if (!this.isConfigured()) {
      throw new PushNotificationException(
        'WEB_PUSH_VAPID_PUBLIC_KEY and WEB_PUSH_VAPID_PRIVATE_KEY must be set',
        PushNotificationExceptionCode.WEB_PUSH_NOT_CONFIGURED,
      );
    }

    try {
      await webPush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: { p256dh: subscription.p256dh, auth: subscription.auth },
        },
        JSON.stringify(payload),
        {
          vapidDetails: {
            subject: this.twentyConfigService.get('WEB_PUSH_VAPID_SUBJECT'),
            publicKey: this.twentyConfigService.get('WEB_PUSH_VAPID_PUBLIC_KEY'),
            privateKey: this.twentyConfigService.get(
              'WEB_PUSH_VAPID_PRIVATE_KEY',
            ),
          },
          TTL: 60 * 60,
          urgency: 'normal',
        },
      );
    } catch (error) {
      if (
        error instanceof WebPushError &&
        GONE_STATUS_CODES.includes(error.statusCode)
      ) {
        this.logger.log(
          `Push subscription ${subscription.id} is gone, deleting it`,
        );
        await this.pushSubscriptionService.deleteById(subscription.id);

        return;
      }

      throw error;
    }
  }
}
