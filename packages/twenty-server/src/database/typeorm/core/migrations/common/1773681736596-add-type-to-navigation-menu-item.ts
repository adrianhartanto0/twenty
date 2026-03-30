import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTypeToNavigationMenuItem1773681736596
  implements MigrationInterface
{
  name = 'AddTypeToNavigationMenuItem1773681736596';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."navigationMenuItem_type_enum" AS ENUM('VIEW', 'FOLDER', 'LINK', 'OBJECT', 'RECORD')`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."navigationMenuItem" ADD "type" "core"."navigationMenuItem_type_enum"`,
    );

    await queryRunner.query(
      `UPDATE core."navigationMenuItem" SET "type" = 'VIEW' WHERE "workspaceId" = '3b8e6458-5fc1-4e63-8563-008ccddaa6db' and viewId IS NOT NULL`,
    );

    await queryRunner.query(
      `UPDATE core."navigationMenuItem" set "type" = 'FOLDER' WHERE "workspaceId" = '3b8e6458-5fc1-4e63-8563-008ccddaa6db' and core."navigationMenuItem"."name" IN ('High Value', 'Workflows')`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."navigationMenuItem" DROP CONSTRAINT "CHK_navigation_menu_item_target_fields"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."navigationMenuItem" ADD CONSTRAINT "CHK_navigation_menu_item_target_fields" CHECK (("targetRecordId" IS NULL AND "targetObjectMetadataId" IS NULL) OR ("targetRecordId" IS NOT NULL AND "targetObjectMetadataId" IS NOT NULL))`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."navigationMenuItem" DROP COLUMN "type"`,
    );

    await queryRunner.query(`DROP TYPE "core"."navigationMenuItem_type_enum"`);
  }
}
