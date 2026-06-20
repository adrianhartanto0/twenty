import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPersonalViewPermission1774499605601 implements MigrationInterface {
    name = 'AddPersonalViewPermission1774499605601'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO "core"."permissionFlag" ("id", "roleId", "flag", "workspaceId", "createdAt", "updatedAt")
            SELECT
                uuid_generate_v4(),
                pf."roleId",
                'PERSONAL_VIEWS',
                pf."workspaceId",
                NOW(),
                NOW()
            FROM "core"."permissionFlag" pf
            WHERE pf."flag" = 'VIEWS'
            ON CONFLICT DO NOTHING
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM "core"."permissionFlag"
            WHERE "flag" = 'PERSONAL_VIEWS'
        `);
    }

}
