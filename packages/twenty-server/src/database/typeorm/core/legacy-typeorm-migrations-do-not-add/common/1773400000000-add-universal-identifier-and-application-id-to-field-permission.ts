import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddUniversalIdentifierAndApplicationIdToFieldPermission1773400000000 implements MigrationInterface {
  name = 'AddUniversalIdentifierAndApplicationIdToFieldPermission1773400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."fieldPermission" ADD "universalIdentifier" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldPermission" ADD "applicationId" uuid`,
    );

    await queryRunner.query(
      `update "core"."fieldPermission" set "applicationId" = '5c73fe9c-6e58-46ce-a960-7a70b086ede2' WHERE "applicationId" = 'f165f91d-84e0-43a9-a7b1-473ff617d294';`
    );

    await queryRunner.query(
      `UPDATE "core"."fieldPermission" SET "applicationId" = 'b719c14d-e644-4c69-b643-36a71cd1eeb9' WHERE "workspaceId" = '3b8e6458-5fc1-4e63-8563-008ccddaa6db'`,
    );

    await queryRunner.query(
      `UPDATE core."fieldPermission" SET "universalIdentifier" = gen_random_uuid()`,
    );

    await queryRunner.query(
      `update "core"."fieldPermission" set "applicationId" = '80da85ae-7721-4ce7-ad6c-16d3a31901b2' WHERE "applicationId" IS NULL;`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."fieldPermission" DROP COLUMN IF EXISTS "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldPermission" DROP COLUMN IF EXISTS "universalIdentifier"`,
    );
  }
}
