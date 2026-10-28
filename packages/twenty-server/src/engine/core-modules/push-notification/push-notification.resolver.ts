import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { RegisterPushSubscriptionInput } from 'src/engine/core-modules/push-notification/dtos/register-push-subscription.input';
import { UnregisterPushSubscriptionInput } from 'src/engine/core-modules/push-notification/dtos/unregister-push-subscription.input';
import { PushSubscriptionEntity } from 'src/engine/core-modules/push-notification/push-subscription.entity';
import { PushNotificationService } from 'src/engine/core-modules/push-notification/services/push-notification.service';
import { PushSubscriptionService } from 'src/engine/core-modules/push-notification/services/push-subscription.service';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';

// Impersonation is refused so an admin's browser never subscribes to another user's notifications
@MetadataResolver()
@UseGuards(
  AuthPrincipalGuard({
    userSession: {
      standard: true,
      impersonated: false,
      playground: false,
      workspaceAgnostic: false,
    },
    apiKey: false,
    oauthClient: false,
    application: false,
  }),
  NoPermissionGuard,
)
export class PushNotificationResolver {
  constructor(
    private readonly pushSubscriptionService: PushSubscriptionService,
    private readonly pushNotificationService: PushNotificationService,
  ) {}

  @Query(() => [PushSubscriptionEntity])
  async pushSubscriptions(
    @AuthUser() { id: userId }: AuthContextUser,
  ): Promise<PushSubscriptionEntity[]> {
    return this.pushSubscriptionService.findByUserId(userId);
  }

  @Mutation(() => PushSubscriptionEntity)
  async registerPushSubscription(
    @AuthUser() { id: userId }: AuthContextUser,
    @Args('input') input: RegisterPushSubscriptionInput,
  ): Promise<PushSubscriptionEntity> {
    return this.pushSubscriptionService.upsert(userId, input);
  }

  @Mutation(() => Boolean)
  async unregisterPushSubscription(
    @AuthUser() { id: userId }: AuthContextUser,
    @Args('input') input: UnregisterPushSubscriptionInput,
  ): Promise<boolean> {
    return this.pushSubscriptionService.deleteByEndpoint(
      userId,
      input.endpoint,
    );
  }

  @Mutation(() => Number)
  async sendTestPushNotification(
    @AuthUser() { id: userId }: AuthContextUser,
  ): Promise<number> {
    return this.pushNotificationService.sendToUser(userId, {
      title: 'Twenty',
      body: 'Push notifications are working on this device.',
      url: '/',
      tag: 'test-push-notification',
    });
  }
}
