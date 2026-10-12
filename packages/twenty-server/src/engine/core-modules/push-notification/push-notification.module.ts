import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { SendPushNotificationJob } from 'src/engine/core-modules/push-notification/jobs/send-push-notification.job';
import { PushNotificationController } from 'src/engine/core-modules/push-notification/push-notification.controller';
import { PushNotificationResolver } from 'src/engine/core-modules/push-notification/push-notification.resolver';
import { PushSubscriptionEntity } from 'src/engine/core-modules/push-notification/push-subscription.entity';
import { PushNotificationSenderService } from 'src/engine/core-modules/push-notification/services/push-notification-sender.service';
import { PushNotificationService } from 'src/engine/core-modules/push-notification/services/push-notification.service';
import { PushSubscriptionService } from 'src/engine/core-modules/push-notification/services/push-subscription.service';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PushSubscriptionEntity]),
    TwentyConfigModule,
    TokenModule,
    WorkspaceCacheStorageModule,
    PermissionsModule,
  ],
  controllers: [PushNotificationController],
  providers: [
    PushSubscriptionService,
    PushNotificationSenderService,
    PushNotificationService,
    PushNotificationResolver,
    SendPushNotificationJob
  ],
  exports: [
    PushSubscriptionService,
    PushNotificationSenderService,
    PushNotificationService,
  ],
})
export class PushNotificationModule {}
