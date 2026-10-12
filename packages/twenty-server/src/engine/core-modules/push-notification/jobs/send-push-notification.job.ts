import { Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { PushNotificationSenderService } from 'src/engine/core-modules/push-notification/services/push-notification-sender.service';
import { PushSubscriptionService } from 'src/engine/core-modules/push-notification/services/push-subscription.service';
import { type SendPushNotificationJobData } from 'src/engine/core-modules/push-notification/types/send-push-notification-job-data.type';

@Processor(MessageQueue.pushNotificationQueue)
export class SendPushNotificationJob {
  private readonly logger = new Logger(SendPushNotificationJob.name);

  constructor(
    private readonly pushSubscriptionService: PushSubscriptionService,
    private readonly pushNotificationSenderService: PushNotificationSenderService,
  ) {}

  @Process(SendPushNotificationJob.name)
  async handle({
    pushSubscriptionId,
    payload,
  }: SendPushNotificationJobData): Promise<void> {
    const subscription =
      await this.pushSubscriptionService.findById(pushSubscriptionId);

    // The subscription can be unregistered between enqueue and processing
    if (!isDefined(subscription)) {
      this.logger.log(
        `Push subscription ${pushSubscriptionId} no longer exists, skipping`,
      );

      return;
    }

    await this.pushNotificationSenderService.send(subscription, payload);
  }
}
