import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { type RegisterPushSubscriptionInput } from 'src/engine/core-modules/push-notification/dtos/register-push-subscription.input';
import { PushSubscriptionEntity } from 'src/engine/core-modules/push-notification/push-subscription.entity';

@Injectable()
export class PushSubscriptionService {
  constructor(
    @InjectRepository(PushSubscriptionEntity)
    private readonly pushSubscriptionRepository: Repository<PushSubscriptionEntity>,
  ) {}

  async findByUserId(userId: string): Promise<PushSubscriptionEntity[]> {
    return this.pushSubscriptionRepository.find({
      where: { userId },
      order: { createdAt: 'ASC' },
    });
  }

  async findById(id: string): Promise<PushSubscriptionEntity | null> {
    return this.pushSubscriptionRepository.findOne({ where: { id } });
  }

  // The endpoint is unique per browser profile, so re-registering the same
  // device after a sign-out simply moves the subscription to the new user.
  async upsert(
    userId: string,
    input: RegisterPushSubscriptionInput,
  ): Promise<PushSubscriptionEntity> {
    const existing = await this.pushSubscriptionRepository.findOne({
      where: { endpoint: input.endpoint },
    });

    const subscription = this.pushSubscriptionRepository.create({
      ...(isDefined(existing) ? { id: existing.id } : {}),
      userId,
      endpoint: input.endpoint,
      p256dh: input.keys.p256dh,
      auth: input.keys.auth,
      userAgent: input.userAgent ?? null,
      expirationTime: input.expirationTime ?? null,
    });

    return this.pushSubscriptionRepository.save(subscription);
  }

  async deleteByEndpoint(userId: string, endpoint: string): Promise<boolean> {
    const result = await this.pushSubscriptionRepository.delete({
      userId,
      endpoint,
    });

    return isDefined(result.affected) && result.affected > 0;
  }

  async deleteById(id: string): Promise<void> {
    await this.pushSubscriptionRepository.delete({ id });
  }
}
