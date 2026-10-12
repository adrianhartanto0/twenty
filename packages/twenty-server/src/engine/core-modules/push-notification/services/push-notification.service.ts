import { Injectable } from '@nestjs/common';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { SendPushNotificationJob } from 'src/engine/core-modules/push-notification/jobs/send-push-notification.job';
import { PushNotificationSenderService } from 'src/engine/core-modules/push-notification/services/push-notification-sender.service';
import { PushSubscriptionService } from 'src/engine/core-modules/push-notification/services/push-subscription.service';
import { type PushNotificationPayload } from 'src/engine/core-modules/push-notification/types/push-notification-payload.type';
import { type SendPushNotificationJobData } from 'src/engine/core-modules/push-notification/types/send-push-notification-job-data.type';

@Injectable()
export class PushNotificationService {
  constructor(
    @InjectMessageQueue(MessageQueue.pushNotificationQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly pushSubscriptionService: PushSubscriptionService,
    private readonly pushNotificationSenderService: PushNotificationSenderService,
  ) {}

  // Fans out to every device the user subscribed; silently no-ops when the
  // instance has no VAPID keys so callers never need to check configuration.
  async sendToUser(
    userId: string,
    payload: PushNotificationPayload,
  ): Promise<number> {
    if (!this.pushNotificationSenderService.isConfigured()) {
      return 0;
    }

    const subscriptions = await this.pushSubscriptionService.findByUserId(userId);

    await Promise.all(
      subscriptions.map((subscription) =>
        this.messageQueueService.add<SendPushNotificationJobData>(
          SendPushNotificationJob.name,
          { pushSubscriptionId: subscription.id, payload },
          { retryLimit: 3 },
        ),
      ),
    );

    return subscriptions.length;
  }
}
