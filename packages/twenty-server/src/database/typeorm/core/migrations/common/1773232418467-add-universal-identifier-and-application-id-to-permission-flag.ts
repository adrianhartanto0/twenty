import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddUniversalIdentifierAndApplicationIdToPermissionFlag1773232418467
  implements MigrationInterface
{
  name = 'AddUniversalIdentifierAndApplicationIdToPermissionFlag1773232418467';

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log("asd")

    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlag" ADD "universalIdentifier" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlag" ADD "applicationId" uuid`,
    );

    await queryRunner.query(
      `UPDATE "core"."permissionFlag" SET "applicationId" = gen_random_uuid() WHERE "workspaceId" != '3b8e6458-5fc1-4e63-8563-008ccddaa6db'`,
    );

    await queryRunner.query(
      `UPDATE "core"."permissionFlag" SET "applicationId" = 'b719c14d-e644-4c69-b643-36a71cd1eeb9' WHERE "workspaceId" = '3b8e6458-5fc1-4e63-8563-008ccddaa6db'`,
    );

    await queryRunner.query(
      `UPDATE "core"."permissionFlag" SET "universalIdentifier" = gen_random_uuid()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlag" DROP COLUMN IF EXISTS "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlag" DROP COLUMN IF EXISTS "universalIdentifier"`,
    );
  }
}
