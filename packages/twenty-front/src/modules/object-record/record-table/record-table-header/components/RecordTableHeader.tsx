import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import { RecordTableHeaderCheckboxColumn } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderCheckboxColumn';
import { RecordTableHeaderDnd } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderDnd';
import { RecordTableHeaderDragDropColumn } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderDragDropColumn';
import { RecordTableHeaderFirstCell } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderFirstCell';
import { useResizeTableHeader } from '@/object-record/record-table/record-table-header/hooks/useResizeTableHeader';
import { isRecordTableCheckboxColumnHiddenComponentState } from '@/object-record/record-table/states/isRecordTableCheckboxColumnHiddenComponentState';
import { isRecordTableDragColumnHiddenComponentState } from '@/object-record/record-table/states/isRecordTableDragColumnHiddenComponentState';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const StyledHeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  position: sticky;
  top: 0;
  z-index: ${TABLE_Z_INDEX.headerRow};
`;

export const RecordTableHeader = () => {
  const isRecordTableDragColumnHidden = useAtomComponentStateValue(
    isRecordTableDragColumnHiddenComponentState,
  );

  const isRecordTableCheckboxColumnHidden = useAtomComponentStateValue(
    isRecordTableCheckboxColumnHiddenComponentState,
  );

  useResizeTableHeader();

  const canEditPersonalViews = useHasPermissionFlag(
    PermissionFlagType.PERSONAL_VIEWS,
  );

  return (
    <StyledHeaderContainer>
      {!isRecordTableDragColumnHidden && <RecordTableHeaderDragDropColumn />}
      {!isRecordTableCheckboxColumnHidden && (
        <RecordTableHeaderCheckboxColumn />
      )}
      <RecordTableHeaderFirstCell />
      {/* <RecordTableHeaderFirstScrollableCell /> */}
      {/* {recordFieldsWithoutLabelIdentifierAndFirstOne.map(
        (recordField, index) => (
          <RecordTableHeaderCell
            key={recordField.fieldMetadataItemId}
            recordField={recordField}
            recordFieldIndex={index + 2}
          />
        ),
      )}
      {isRecordTableColumnHeadersReadOnly  && <RecordTableHeaderEmptyLastColumn />}
      {
        canEditPersonalViews && <RecordTableHeaderAddColumnButton />
      }
      <RecordTableHeaderLastEmptyColumn /> */}
      <RecordTableHeaderDnd />
    </StyledHeaderContainer>
  );
};
