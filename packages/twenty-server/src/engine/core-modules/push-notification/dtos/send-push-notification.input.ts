import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class SendPushNotificationInput {
  @IsUUID()
  workspaceMemberId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  body?: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  tag?: string;
}
