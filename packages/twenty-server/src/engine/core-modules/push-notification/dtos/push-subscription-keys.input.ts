import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class PushSubscriptionKeysInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  p256dh: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  auth: string;
}
