import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';

import { PushSubscriptionKeysInput } from 'src/engine/core-modules/push-notification/dtos/push-subscription-keys.input';

@InputType()
export class RegisterPushSubscriptionInput {
  @Field(() => String)
  @IsUrl({ require_tld: false })
  @IsNotEmpty()
  endpoint: string;

  @Field(() => PushSubscriptionKeysInput)
  @ValidateNested()
  @Type(() => PushSubscriptionKeysInput)
  keys: PushSubscriptionKeysInput;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  userAgent?: string;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  expirationTime?: Date;
}
