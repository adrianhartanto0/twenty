import { MigrationInterface, QueryRunner } from "typeorm";

export class Common1774499449273 implements MigrationInterface {
    name = 'Common1774499449273'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."workspace" DROP CONSTRAINT "FK_282123b2f32e927b6003311e33a"`);
        await queryRunner.query(`ALTER TABLE "core"."application" DROP COLUMN "settingsCustomTabFrontComponentId"`);
        await queryRunner.query(`ALTER TABLE "core"."workspace" DROP CONSTRAINT "UQ_282123b2f32e927b6003311e33a"`);
        await queryRunner.query(`ALTER TABLE "core"."workspace" DROP COLUMN "logoFileId"`);
        await queryRunner.query(`ALTER TABLE "core"."workspace" DROP COLUMN "autoEnableNewAiModels"`);
        await queryRunner.query(`ALTER TABLE "core"."workspace" DROP COLUMN "disabledAiModelIds"`);
        await queryRunner.query(`ALTER TABLE "core"."workspace" DROP COLUMN "enabledAiModelIds"`);
        await queryRunner.query(`ALTER TABLE "core"."workspace" DROP COLUMN "useRecommendedModels"`);
        await queryRunner.query(`ALTER TABLE "core"."navigationMenuItem" DROP COLUMN "icon"`);
        await queryRunner.query(`ALTER TABLE "core"."frontComponent" DROP COLUMN "isHeadless"`);
        await queryRunner.query(`ALTER TABLE "core"."navigationMenuItem" DROP COLUMN "position"`);
        await queryRunner.query(`ALTER TABLE "core"."navigationMenuItem" ADD "position" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."navigationMenuItem" DROP COLUMN "position"`);
        await queryRunner.query(`ALTER TABLE "core"."navigationMenuItem" ADD "position" double precision NOT NULL`);
        await queryRunner.query(`ALTER TABLE "core"."frontComponent" ADD "isHeadless" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "core"."navigationMenuItem" ADD "icon" text`);
        await queryRunner.query(`ALTER TABLE "core"."workspace" ADD "useRecommendedModels" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "core"."workspace" ADD "enabledAiModelIds" character varying array NOT NULL DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "core"."workspace" ADD "disabledAiModelIds" character varying array NOT NULL DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "core"."workspace" ADD "autoEnableNewAiModels" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "core"."workspace" ADD "logoFileId" uuid`);
        await queryRunner.query(`ALTER TABLE "core"."workspace" ADD CONSTRAINT "UQ_282123b2f32e927b6003311e33a" UNIQUE ("logoFileId")`);
        await queryRunner.query(`ALTER TABLE "core"."application" ADD "settingsCustomTabFrontComponentId" uuid`);
        await queryRunner.query(`ALTER TABLE "core"."workspace" ADD CONSTRAINT "FK_282123b2f32e927b6003311e33a" FOREIGN KEY ("logoFileId") REFERENCES "core"."file"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
