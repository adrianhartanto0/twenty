import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddUniversalIdentifierAndApplicationIdToObjectPermission1773317160558
  implements MigrationInterface
{
  name =
    'AddUniversalIdentifierAndApplicationIdToObjectPermission1773317160558';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."objectPermission" ADD "universalIdentifier" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectPermission" ADD "applicationId" uuid`,
    );

    await queryRunner.query(
      `UPDATE core."objectPermission" SET "applicationId" = 'b719c14d-e644-4c69-b643-36a71cd1eeb9' WHERE "workspaceId" = '3b8e6458-5fc1-4e63-8563-008ccddaa6db'`,
    );

    await queryRunner.query(
      `UPDATE core."objectPermission" SET "universalIdentifier" = gen_random_uuid() WHERE "workspaceId" = '3b8e6458-5fc1-4e63-8563-008ccddaa6db'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."objectPermission" DROP COLUMN IF EXISTS "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectPermission" DROP COLUMN IF EXISTS "universalIdentifier"`,
    );
  }
}
