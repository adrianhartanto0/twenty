import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { PermissionFlagType } from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  type ObjectsPermissions,
  type ObjectsPermissionsByRoleId,
  type RestrictedFieldsPermissions,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, IsNull, Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { FieldPermissionEntity } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.entity';
import { ObjectPermissionEntity } from 'src/engine/metadata-modules/object-permission/object-permission.entity';
import { PermissionFlagEntity } from 'src/engine/metadata-modules/permission-flag/permission-flag.entity';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { RowLevelPermissionPredicateGroupEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate-group.entity';
import { RowLevelPermissionPredicateEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';

const WORKFLOW_STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.workflow.universalIdentifier,
  STANDARD_OBJECTS.workflowRun.universalIdentifier,
  STANDARD_OBJECTS.workflowVersion.universalIdentifier,
] as const;

@Injectable()
@WorkspaceCache('rolesPermissions')
export class WorkspaceRolesPermissionsCacheService extends WorkspaceCacheProvider<ObjectsPermissionsByRoleId> {
  constructor(
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @InjectRepository(RoleTargetEntity)
    private readonly roleTargetRepository: Repository<RoleTargetEntity>,
    @InjectRepository(ObjectPermissionEntity)
    private readonly objectPermissionRepository: Repository<ObjectPermissionEntity>,
    @InjectRepository(PermissionFlagEntity)
    private readonly permissionFlagRepository: Repository<PermissionFlagEntity>,
    @InjectRepository(FieldPermissionEntity)
    private readonly fieldPermissionRepository: Repository<FieldPermissionEntity>,
    @InjectRepository(RowLevelPermissionPredicateEntity)
    private readonly rowLevelPermissionPredicateRepository: Repository<RowLevelPermissionPredicateEntity>,
    @InjectRepository(RowLevelPermissionPredicateGroupEntity)
    private readonly rowLevelPermissionPredicateGroupRepository: Repository<RowLevelPermissionPredicateGroupEntity>,
) {
super();
  }

  // async computeForCache(
  //   workspaceId: string,
  // ): Promise<ObjectsPermissionsByRoleId> {
  //   const roles = await this.roleRepository.find({
  //     where: {
  //       workspaceId,
  //     },
  //     relations: [
  //       'objectPermissions',
  //       'permissionFlags',
  //       'fieldPermissions',
  //       'rowLevelPermissionPredicates',
  //       'rowLevelPermissionPredicateGroups',
  //     ],
  //   });

  //   const workspaceObjectMetadataCollection =
  //     await this.getWorkspaceObjectMetadataCollection(workspaceId);

  //   const permissionsByRoleId: ObjectsPermissionsByRoleId = {};

  //   for (const role of roles) {
  //     const objectRecordsPermissions: ObjectsPermissions = {};

  //     for (const objectMetadata of workspaceObjectMetadataCollection) {
  //       const {
  //         id: objectMetadataId,
  //         isSystem,
  //         universalIdentifier,
  //       } = objectMetadata;

  //       let canRead = role.canReadAllObjectRecords;
  //       let canUpdate = role.canUpdateAllObjectRecords;
  //       let canSoftDelete = role.canSoftDeleteAllObjectRecords;
  //       let canDestroy = role.canDestroyAllObjectRecords;
  //       const restrictedFields: RestrictedFieldsPermissions = {};

  //       if (
  //         WORKFLOW_STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.includes(
  //           universalIdentifier as (typeof WORKFLOW_STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS)[number],
  //         )
  //       ) {
  //         const hasWorkflowsPermissions = this.hasWorkflowsPermissions(role);

  //         canRead = hasWorkflowsPermissions;
  //         canUpdate = hasWorkflowsPermissions;
  //         canSoftDelete = hasWorkflowsPermissions;
  //         canDestroy = hasWorkflowsPermissions;
  //       } else {
  //         const objectRecordPermissionsOverride = role.objectPermissions.find(
  //           (objectPermission) =>
  //             objectPermission.objectMetadataId === objectMetadataId,
  //         );

  //         const getPermissionValue = (
  //           overrideValue: boolean | undefined,
  //           defaultValue: boolean,
  //         ) => (isSystem ? true : (overrideValue ?? defaultValue));

  //         canRead = getPermissionValue(
  //           objectRecordPermissionsOverride?.canReadObjectRecords,
  //           canRead,
  //         );
  //         canUpdate = getPermissionValue(
  //           objectRecordPermissionsOverride?.canUpdateObjectRecords,
  //           canUpdate,
  //         );
  //         canSoftDelete = getPermissionValue(
  //           objectRecordPermissionsOverride?.canSoftDeleteObjectRecords,
  //           canSoftDelete,
  //         );
  //         canDestroy = getPermissionValue(
  //           objectRecordPermissionsOverride?.canDestroyObjectRecords,
  //           canDestroy,
  //         );

  //         const fieldPermissions = role.fieldPermissions.filter(
  //           (fieldPermission) =>
  //             fieldPermission.objectMetadataId === objectMetadataId,
  //         );

  //         for (const fieldPermission of fieldPermissions) {
  //           const isFieldLabelIdentifier =
  //             fieldPermission.fieldMetadataId ===
  //             objectMetadata.labelIdentifierFieldMetadataId;

  //           if (
  //             isDefined(fieldPermission.canReadFieldValue) ||
  //             isDefined(fieldPermission.canUpdateFieldValue)
  //           ) {
  //             restrictedFields[fieldPermission.fieldMetadataId] = {
  //               canRead: isFieldLabelIdentifier
  //                 ? true
  //                 : fieldPermission.canReadFieldValue,
  //               canUpdate: fieldPermission.canUpdateFieldValue,
  //             };
  //           }
  //         }
  //       }

  //       objectRecordsPermissions[objectMetadataId] = {
  //         canReadObjectRecords: canRead,
  //         canUpdateObjectRecords: canUpdate,
  //         canSoftDeleteObjectRecords: canSoftDelete,
  //         canDestroyObjectRecords: canDestroy,
  //         restrictedFields,
  //         rowLevelPermissionPredicates:
  //           role.rowLevelPermissionPredicates.filter(
  //             (rowLevelPermissionPredicate) =>
  //               rowLevelPermissionPredicate.objectMetadataId ===
  //               objectMetadataId,
  //           ),
  //         rowLevelPermissionPredicateGroups:
  //           role.rowLevelPermissionPredicateGroups.filter(
  //             (rowLevelPermissionPredicateGroup) =>
  //               rowLevelPermissionPredicateGroup.objectMetadataId ===
  //               objectMetadataId,
  //           ),
  //       };
  //     }

  //     permissionsByRoleId[role.id] = objectRecordsPermissions;
  //   }

  //   return permissionsByRoleId;
  // }

 async computeForCache(
    workspaceId: string,
  ): Promise<ObjectsPermissionsByRoleId> {
    console.trace("asd")

    const roles = await this.roleRepository.find({
      where: { workspaceId },
      select: [
        'id',
        'workspaceId',
        'universalIdentifier',
        'applicationId',
        'label',
        'canUpdateAllSettings',
        'canAccessAllTools',
        'canReadAllObjectRecords',
        'canUpdateAllObjectRecords',
        'canSoftDeleteAllObjectRecords',
        'canDestroyAllObjectRecords',
        'description',
        'icon',
        'createdAt',
        'updatedAt',
        'isEditable',
        'canBeAssignedToUsers',
        'canBeAssignedToAgents',
        'canBeAssignedToApiKeys',
      ],
    });

    if (roles.length === 0) {
      return {};
    }

    const roleIds = roles.map(r => r.id);

  // 2. Fetch all object permissions for these roles (parallel)
    const [
      objectPermissions,
      permissionFlags,
      fieldPermissions,
      rowLevelPermissionPredicates,
      rowLevelPermissionPredicateGroups,
    ] = await Promise.all([
      // Object permissions
      this.objectPermissionRepository.find({
        where: { roleId: In(roleIds) },
        select: [
          'id',
          'workspaceId',
          'roleId',
          'objectMetadataId',
          'canReadObjectRecords',
          'canUpdateObjectRecords',
          'canSoftDeleteObjectRecords',
          'canDestroyObjectRecords',
          'createdAt',
          'updatedAt',
        ],
      }),

      // Permission flags
      this.permissionFlagRepository.find({
        where: { roleId: In(roleIds) },
        select: [
          'id',
          'workspaceId',
          'roleId',
          'flag',
          'createdAt',
          'updatedAt',
        ],
      }),

      // Field permissions
      this.fieldPermissionRepository.find({
        where: { roleId: In(roleIds) },
        select: [
          'id',
          'workspaceId',
          'roleId',
          'objectMetadataId',
          'fieldMetadataId',
          'canReadFieldValue',
          'canUpdateFieldValue',
          'createdAt',
          'updatedAt',
        ],
      }),

      // Row-level permission predicates (with soft delete filter)
      this.rowLevelPermissionPredicateRepository.find({
        where: {
          roleId: In(roleIds),
          deletedAt: IsNull(),  // Explicit soft delete filter
        },
        select: [
          'id',
          'workspaceId',
          'universalIdentifier',
          'applicationId',
          'fieldMetadataId',
          'objectMetadataId',
          'operand',
          'value',
          'subFieldName',
          'workspaceMemberFieldMetadataId',
          'workspaceMemberSubFieldName',
          'rowLevelPermissionPredicateGroupId',
          'positionInRowLevelPermissionPredicateGroup',
          'roleId',
          'createdAt',
          'updatedAt',
          'deletedAt',
        ],
      }),

      // Row-level permission predicate groups (with soft delete filter)
      this.rowLevelPermissionPredicateGroupRepository.find({
        where: {
          roleId: In(roleIds),
          deletedAt: IsNull(),  // Explicit soft delete filter
        },
        select: [
          'id',
          'workspaceId',
          'universalIdentifier',
          'applicationId',
          'parentRowLevelPermissionPredicateGroupId',
          'logicalOperator',
          'positionInRowLevelPermissionPredicateGroup',
          'roleId',
          'objectMetadataId',
          'createdAt',
          'updatedAt',
          'deletedAt',
        ],
      }),
    ]);

    const workspaceObjectMetadataCollection =
      await this.getWorkspaceObjectMetadataCollection(workspaceId);

    const permissionsByRoleId: ObjectsPermissionsByRoleId = {};

    for (const role of roles) {
      const objectRecordsPermissions: ObjectsPermissions = {};

      for (const objectMetadata of workspaceObjectMetadataCollection) {
        const {
          id: objectMetadataId,
          isSystem,
          universalIdentifier,
        } = objectMetadata;

        let canRead = role.canReadAllObjectRecords;
        let canUpdate = role.canUpdateAllObjectRecords;
        let canSoftDelete = role.canSoftDeleteAllObjectRecords;
        let canDestroy = role.canDestroyAllObjectRecords;
        const restrictedFields: RestrictedFieldsPermissions = {};

        const permissionFlagsByRoleId = this.groupBy(permissionFlags, 'roleId');
        const rolePermissionFlags = permissionFlagsByRoleId.get(role.id) || []

        if (
          WORKFLOW_STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.includes(
            universalIdentifier as (typeof WORKFLOW_STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS)[number],
          )
        ) {
          const hasWorkflowsPermissions = this.hasWorkflowsPermissions(role, rolePermissionFlags);

          canRead = hasWorkflowsPermissions;
          canUpdate = hasWorkflowsPermissions;
          canSoftDelete = hasWorkflowsPermissions;
          canDestroy = hasWorkflowsPermissions;
        } else {
          const objectPermissionsByRoleId = this.groupBy(objectPermissions, 'roleId');
          const fieldPermissionsByRoleId = this.groupBy(fieldPermissions, 'roleId');

          const roleObjectPermissions = objectPermissionsByRoleId.get(role.id) || []
          const roleFieldPermissions = fieldPermissionsByRoleId.get(role.id) || []

          const objectRecordPermissionsOverride = roleObjectPermissions.find(
            (objectPermission) =>
              objectPermission.objectMetadataId === objectMetadataId,
          );

          const getPermissionValue = (
            overrideValue: boolean | undefined,
            defaultValue: boolean,
          ) => (isSystem ? true : (overrideValue ?? defaultValue));

          canRead = getPermissionValue(
            objectRecordPermissionsOverride?.canReadObjectRecords,
            canRead,
          );
          canUpdate = getPermissionValue(
            objectRecordPermissionsOverride?.canUpdateObjectRecords,
            canUpdate,
          );
          canSoftDelete = getPermissionValue(
            objectRecordPermissionsOverride?.canSoftDeleteObjectRecords,
            canSoftDelete,
          );
          canDestroy = getPermissionValue(
            objectRecordPermissionsOverride?.canDestroyObjectRecords,
            canDestroy,
          );

          const filteredFieldPermissions = roleFieldPermissions.filter(
            (fieldPermission) =>
              fieldPermission.objectMetadataId === objectMetadataId,
          );

          for (const fieldPermission of filteredFieldPermissions) {
            const isFieldLabelIdentifier =
              fieldPermission.fieldMetadataId ===
              objectMetadata.labelIdentifierFieldMetadataId;

            if (
              isDefined(fieldPermission.canReadFieldValue) ||
              isDefined(fieldPermission.canUpdateFieldValue)
            ) {
              restrictedFields[fieldPermission.fieldMetadataId] = {
                canRead: isFieldLabelIdentifier
                  ? true
                  : fieldPermission.canReadFieldValue,
                canUpdate: fieldPermission.canUpdateFieldValue,
              };
            }
          }
        }

        const predicatesByRoleId = this.groupBy(rowLevelPermissionPredicates, 'roleId');
        const predicateGroupsByRoleId = this.groupBy(rowLevelPermissionPredicateGroups, 'roleId');

        const rolePredicates = predicatesByRoleId.get(role.id) || []
        const roleFieldPermissions = predicateGroupsByRoleId.get(role.id) || []

        objectRecordsPermissions[objectMetadataId] = {
          canReadObjectRecords: canRead,
          canUpdateObjectRecords: canUpdate,
          canSoftDeleteObjectRecords: canSoftDelete,
          canDestroyObjectRecords: canDestroy,
          restrictedFields,
          rowLevelPermissionPredicates:
            rolePredicates.filter(
              (rowLevelPermissionPredicate) =>
                rowLevelPermissionPredicate.objectMetadataId ===
                objectMetadataId,
            ),
          rowLevelPermissionPredicateGroups:
            roleFieldPermissions.filter(
              (rowLevelPermissionPredicateGroup) =>
                rowLevelPermissionPredicateGroup.objectMetadataId ===
                objectMetadataId,
            ),
        };
      }

      permissionsByRoleId[role.id] = objectRecordsPermissions;
    }

    return permissionsByRoleId;
  }

  private async getWorkspaceObjectMetadataCollection(
    workspaceId: string,
  ): Promise<ObjectMetadataEntity[]> {
    const workspaceObjectMetadata = await this.objectMetadataRepository.find({
      where: {
        workspaceId,
      },
      select: [
        'id',
        'isSystem',
        'universalIdentifier',
        'labelIdentifierFieldMetadataId',
      ],
    });

    return workspaceObjectMetadata;
  }

  private groupBy<T>(array: T[], key: keyof T): Map<string, T[]> {
    const map = new Map<string, T[]>();
    for (const item of array) {
      const groupKey = String(item[key]);
      const existing = map.get(groupKey);
      if (existing) {
        existing.push(item);
      } else {
        map.set(groupKey, [item]);
      }
    }
    return map;
  }

  private hasWorkflowsPermissions(role: RoleEntity, rolePermissionFlag: PermissionFlagEntity[]): boolean {
    const hasWorkflowsPermissionFromRole = role.canUpdateAllSettings;
    const hasWorkflowsPermissionsFromSettingPermissions = isDefined(
      rolePermissionFlag.find(
        (permissionFlag) =>
          permissionFlag.flag === PermissionFlagType.WORKFLOWS,
      ),
    );

    return (
      hasWorkflowsPermissionFromRole ||
      hasWorkflowsPermissionsFromSettingPermissions
    );
  }
}
