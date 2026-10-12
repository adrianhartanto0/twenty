import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class UnregisterPushSubscriptionInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  endpoint: string;
}
