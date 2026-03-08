/* @license Enterprise */

import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';
import { isDefined } from 'twenty-shared/utils';
import {
  Brackets,
  NotBrackets,
  type ObjectLiteral,
  type WhereExpressionBuilder,
} from 'typeorm';

import { GraphqlQueryFilterFieldParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-filter/graphql-query-filter-field.parser';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-select-query-builder';
import { buildRowLevelPermissionRecordFilter } from 'src/engine/twenty-orm/utils/build-row-level-permission-record-filter.util';
import { RelationType } from 'twenty-shared/types';

type ApplyRowLevelPermissionPredicatesArgs<T extends ObjectLiteral> = {
  queryBuilder: WorkspaceSelectQueryBuilder<T>;
  objectMetadata: FlatObjectMetadata;
  internalContext: WorkspaceInternalContext;
  authContext: AuthContext;
  featureFlagMap: FeatureFlagMap;
};



const applyObjectRecordFilterToQueryBuilder = <T extends ObjectLiteral>({
  queryBuilder,
  objectNameSingular,
  recordFilter,
  fieldParser,
  useDirectTableReference = false,
}: {
  queryBuilder: WorkspaceSelectQueryBuilder<T>;
  objectNameSingular: string;
  recordFilter: Record<string, unknown>;
  fieldParser: GraphqlQueryFilterFieldParser;
  useDirectTableReference?: boolean;
}): void => {
  if (!recordFilter || Object.keys(recordFilter).length === 0) {
    return;
  }

  console.log(recordFilter)

  const whereCondition = new Brackets((qb) => {
    Object.entries(recordFilter).forEach(([key, value], index) => {
      parseKeyFilter({
        queryBuilder: qb,
        objectNameSingular,
        key,
        value,
        isFirst: index === 0,
        fieldParser,
        useDirectTableReference,
      });
    });
  });

  if (queryBuilder.expressionMap.wheres.length === 0) {
    queryBuilder.where(whereCondition);
  } else {
    queryBuilder.andWhere(whereCondition);
  }
};

const parseKeyFilter = ({
  queryBuilder,
  objectNameSingular,
  key,
  value,
  isFirst,
  fieldParser,
  useDirectTableReference = false,
}: {
  queryBuilder: WhereExpressionBuilder;
  objectNameSingular: string;
  key: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  isFirst: boolean;
  fieldParser: GraphqlQueryFilterFieldParser;
  useDirectTableReference?: boolean;
}): void => {
  switch (key) {
    case 'and': {
      const andWhereCondition = new Brackets((qb) => {
        value.forEach((filter: Record<string, unknown>, index: number) => {
          const whereCondition = new Brackets((qb2) => {
            Object.entries(filter).forEach(
              ([subFilterKey, subFilterValue], subIndex) => {
                parseKeyFilter({
                  queryBuilder: qb2,
                  objectNameSingular,
                  key: subFilterKey,
                  value: subFilterValue,
                  isFirst: subIndex === 0,
                  fieldParser,
                  useDirectTableReference,
                });
              },
            );
          });

          if (index === 0) {
            qb.where(whereCondition);
          } else {
            qb.andWhere(whereCondition);
          }
        });
      });

      if (isFirst) {
        queryBuilder.where(andWhereCondition);
      } else {
        queryBuilder.andWhere(andWhereCondition);
      }
      break;
    }
    case 'or': {
      const orWhereCondition = new Brackets((qb) => {
        value.forEach((filter: Record<string, unknown>, index: number) => {
          const whereCondition = new Brackets((qb2) => {
            Object.entries(filter).forEach(
              ([subFilterKey, subFilterValue], subIndex) => {
                parseKeyFilter({
                  queryBuilder: qb2,
                  objectNameSingular,
                  key: subFilterKey,
                  value: subFilterValue,
                  isFirst: subIndex === 0,
                  fieldParser,
                  useDirectTableReference,
                });
              },
            );
          });

          if (index === 0) {
            qb.where(whereCondition);
          } else {
            qb.orWhere(whereCondition);
          }
        });
      });

      if (isFirst) {
        queryBuilder.where(orWhereCondition);
      } else {
        queryBuilder.andWhere(orWhereCondition);
      }

      break;
    }
    case 'not': {
      const notWhereCondition = new NotBrackets((qb) => {
        Object.entries(value).forEach(
          ([subFilterKey, subFilterValue], subIndex) => {
            parseKeyFilter({
              queryBuilder: qb,
              objectNameSingular,
              key: subFilterKey,
              value: subFilterValue,
              isFirst: subIndex === 0,
              fieldParser,
              useDirectTableReference,
            });
          },
        );
      });

      if (isFirst) {
        queryBuilder.where(notWhereCondition);
      } else {
        queryBuilder.andWhere(notWhereCondition);
      }

      break;
    }
    default:
      fieldParser.parse(
        queryBuilder,
        objectNameSingular,
        key,
        value,
        isFirst,
        useDirectTableReference,
      );
      break;
  }
};

export const applyRowLevelPermissionPredicates = <T extends ObjectLiteral>({
  queryBuilder,
  objectMetadata,
  internalContext,
  authContext,
  featureFlagMap,
}: ApplyRowLevelPermissionPredicatesArgs<T>): void => {
  if (
    featureFlagMap[
      FeatureFlagKey.IS_ROW_LEVEL_PERMISSION_PREDICATES_ENABLED
    ] !== true
  ) {
    return;
  }

  const roleId = authContext.userWorkspaceId
    ? internalContext.userWorkspaceRoleMap[authContext.userWorkspaceId]
    : undefined;

  const rowLevelPredicates = { ...internalContext.flatRowLevelPermissionPredicateMaps.byUniversalIdentifier }

  let connectedObjects = []

  if (objectMetadata.nameSingular === "company") {
    const predicates = Object.values(rowLevelPredicates)
      .filter(isDefined)
      .filter(
        (predicate) =>
          predicate.roleId === roleId &&
          !isDefined(predicate.deletedAt),
        );

    if (predicates.length != 0) {
      connectedObjects = Object.values(rowLevelPredicates)
        .filter(item => isDefined(item?.objectMetadataId))
        .reduce((acc, item) => {
          const rowLevelObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: item.objectMetadataId as string,
            flatEntityMaps: internalContext.flatObjectMetadataMaps,
          });

          if (!isDefined(rowLevelObjectMetadata)) return acc;

          const relationalFieldMetadata = rowLevelObjectMetadata.fieldIds
            .map(fieldId => {
              const fieldMetadata = findFlatEntityByIdInFlatEntityMaps({
                flatEntityId: fieldId,
                flatEntityMaps: internalContext.flatFieldMetadataMaps,
              });

              if (
                isDefined(fieldMetadata) &&
                fieldMetadata.name === objectMetadata?.nameSingular &&
                isDefined(fieldMetadata?.settings) && fieldMetadata?.settings.relationType === RelationType.MANY_TO_ONE
              ) {
                return fieldMetadata?.settings.joinColumnName
              }
            }).filter(isDefined)

          if (relationalFieldMetadata.length > 0) {
            const fieldMetadataObject = findFlatEntityByIdInFlatEntityMaps({
              flatEntityId: item?.fieldMetadataId as string,
              flatEntityMaps: internalContext.flatFieldMetadataMaps,
            })

            acc.push({
              fieldMetadataObject: {
                name: fieldMetadataObject?.settings.joinColumnName
              },
              rowLevelObjectMetadata: {
                name: rowLevelObjectMetadata?.nameSingular
              },
              relationalFieldMetadataName: relationalFieldMetadata[0],
              value: item.value || authContext.workspaceMember?.id
            });
          }

          return acc;
        }, []);

      console.log(connectedObjects)
      console.log("fgh")
    }
  }

  const recordFilter = buildRowLevelPermissionRecordFilter({
    flatRowLevelPermissionPredicateMaps:
      internalContext.flatRowLevelPermissionPredicateMaps,
    flatRowLevelPermissionPredicateGroupMaps:
      internalContext.flatRowLevelPermissionPredicateGroupMaps,
    flatFieldMetadataMaps: internalContext.flatFieldMetadataMaps,
    objectMetadata,
    roleId,
    authContext,
  });


  const hasOtherFilters = recordFilter && Object.keys(recordFilter).length > 0

  if (hasOtherFilters) {
    const isUpdateOrDeleteQuery =
      queryBuilder.expressionMap.queryType === 'update' ||
      queryBuilder.expressionMap.queryType === 'soft-delete' ||
      queryBuilder.expressionMap.queryType === 'delete';

    applyObjectRecordFilterToQueryBuilder({
      queryBuilder,
      objectNameSingular: objectMetadata.nameSingular,
      recordFilter,
      fieldParser: new GraphqlQueryFilterFieldParser(
        objectMetadata,
        internalContext.flatFieldMetadataMaps,
      ),
      useDirectTableReference: isUpdateOrDeleteQuery,
    });
  }

  if (connectedObjects.length > 0) {
    const maps = {}

    connectedObjects.forEach((item, index) => {
      const {
        fieldMetadataObject,
        rowLevelObjectMetadata,
        relationalFieldMetadataName,
        value
      } = item

      const metadataName = rowLevelObjectMetadata.name
      const columnName = fieldMetadataObject.name

      const objectKey = `${metadataName}:${relationalFieldMetadataName}:${columnName}`

      if (maps[objectKey]) {
        maps[objectKey] = [ value, ...maps[objectKey]]
      } else {
        maps[objectKey] = [value]
      }
    })

    Object.keys(maps).forEach(key => {
      const splittedKey = key.split(":")

      queryBuilder
        .leftJoin(
          splittedKey[0], splittedKey[0].toLowerCase(),
          `${objectMetadata.nameSingular}.id = ${splittedKey[0].toLowerCase()}.${splittedKey[1]}`
        )

        const condition = `${splittedKey[0].toLowerCase()}.${splittedKey[2]} IN (:...userIds)`;
        queryBuilder.orWhere(condition, { userIds: maps[key] })

        console.log(queryBuilder.getQuery())
    })
  }

};
