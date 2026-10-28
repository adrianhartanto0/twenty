
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import {
  type ObjectPermissions,
  type QueryCursorDirection,
  type RecordGqlOperationGqlRecordFields,
} from 'twenty-shared/types';

export const generateRowLevelFilter = ({
  objectMetadataItem,
  objectPermissionsByObjectMetadataId,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  recordGqlFields?: RecordGqlOperationGqlRecordFields;
  computeReferences?: boolean;
  cursorDirection?: QueryCursorDirection;
  objectPermissionsByObjectMetadataId: Record<
    string,
    ObjectPermissions & { objectMetadataId: string }
  >;
}) => {

}
