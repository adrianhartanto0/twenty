import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.26.0', 1791471805824)
export class CreatePushSubscriptionTableFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "core"."pushSubscription" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "endpoint" text NOT NULL, "p256dh" text NOT NULL, "auth" text NOT NULL, "userAgent" text, "expirationTime" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "IDX_PUSH_SUBSCRIPTION_ENDPOINT_UNIQUE" UNIQUE ("endpoint"), CONSTRAINT "PK_PUSH_SUBSCRIPTION_ID" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE INDEX "IDX_PUSH_SUBSCRIPTION_USER_ID" ON "core"."pushSubscription" ("userId") ');
    await queryRunner.query('ALTER TABLE "core"."pushSubscription" ADD CONSTRAINT "FK_PUSH_SUBSCRIPTION_USER_ID" FOREIGN KEY ("userId") REFERENCES "core"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."pushSubscription" DROP CONSTRAINT "FK_PUSH_SUBSCRIPTION_USER_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_PUSH_SUBSCRIPTION_USER_ID"');
    await queryRunner.query('DROP TABLE "core"."pushSubscription"');
  }
}
