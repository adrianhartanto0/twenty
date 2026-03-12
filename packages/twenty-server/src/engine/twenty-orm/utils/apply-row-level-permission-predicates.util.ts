/* @license Enterprise */

import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';
import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';
import {
  Brackets,
  NotBrackets,
  type ObjectLiteral,
  type WhereExpressionBuilder,
} from 'typeorm';

import { isDefined } from 'class-validator';
import { GraphqlQueryFilterFieldParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-filter/graphql-query-filter-field.parser';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-select-query-builder';
import { buildRowLevelPermissionRecordFilter } from 'src/engine/twenty-orm/utils/build-row-level-permission-record-filter.util';

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

  // console.log(recordFilter)

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

  let uniqueRelationFilters = {}

  if (objectMetadata.nameSingular === "company") {
    const predicates = Object.values(rowLevelPredicates)
      .filter(isDefined)
      .filter(
        (predicate) =>
          predicate.roleId === roleId &&
          !isDefined(predicate.deletedAt),
        );

    if (predicates.length != 0) {
      const relationFilters = Object.values(rowLevelPredicates)
        .filter(item => isDefined(item?.objectMetadataId))
        .map((item) => {
          const fieldMetadata = findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: item.fieldMetadataId,
            flatEntityMaps: internalContext.flatFieldMetadataMaps,
          });

          if (isDefined(fieldMetadata)) {
            if (fieldMetadata.name.search(/assignment/i) > 0) {
              return {
                name: fieldMetadata.name,
                value: item.value || authContext.workspaceMember?.id
              }
            }
          }
        });

      relationFilters.forEach((item) => {
        if (isDefined(item)) {
          if (isDefined(uniqueRelationFilters[item.name])) {
            uniqueRelationFilters[item.name] = [ item.value, ...uniqueRelationFilters[item.name]]
          } else {
            uniqueRelationFilters[item.name] = [ item.value ]
          }
        }
      })

      // console.log(uniqueRelationFilters)
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

  console.log(uniqueRelationFilters)

  Object.keys(uniqueRelationFilters).forEach((key) => {
    const rowLevelObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: internalContext.objectIdByNameSingular[key] as string,
      flatEntityMaps: internalContext.flatObjectMetadataMaps
    })

    console.log(rowLevelObjectMetadata)

    if (rowLevelObjectMetadata?.fieldIds) {
      const userFields = rowLevelObjectMetadata?.fieldIds.map(fieldId => {
        const fieldMetadata = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: fieldId,
          flatEntityMaps: internalContext.flatFieldMetadataMaps,
        });

        if (fieldMetadata.name !== objectMetadata.nameSingular && fieldMetadata.type === "RELATION") {
          return fieldMetadata
        }
      }).filter(isDefined)

      console.log(userFields)

      if (userFields.length == 1){
        const userField = userFields.pop()

        queryBuilder
          .orWhere(qb => {
            const subQuery = qb
              .subQuery()
              .select(`${key}.${objectMetadata.nameSingular}Id`)
              .from(key, key)
              .where(`${key}.${userField.name}Id IN (:...userIds)`,  { userIds: uniqueRelationFilters[key] })
              .andWhere('observerassignment.deletedAt IS NULL')
              .getQuery();

            return `${objectMetadata.nameSingular}.id IN ` + subQuery;
          })

          // .leftJoin(key, key, `${objectMetadata.nameSingular}.id = ${key}.${objectMetadata.nameSingular}Id`)
          // .orWhere(`${key}.${userField.name}Id IN (:...userIds)`, { userIds: uniqueRelationFilters[key] })

        console.log(queryBuilder.getQuery())
      }
    }
  })
};
