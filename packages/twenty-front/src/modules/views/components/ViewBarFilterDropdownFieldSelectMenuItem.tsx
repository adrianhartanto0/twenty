import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FILTER_FIELD_LIST_ID } from '@/object-record/object-filter-dropdown/constants/FilterFieldListId';
import { useWorkspaceMemberRoles } from '@/settings/members/hooks/useWorkspaceMemberRoles';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { isSelectedItemIdComponentFamilyState } from '@/ui/layout/selectable-list/states/isSelectedItemIdComponentFamilyState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useInitializeFilterOnFieldMetadataItemFromViewBarFilterDropdown } from '@/views/hooks/useInitializeFilterOnFieldMetadataItemFromViewBarFilterDropdown';
import { useIcons } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

export type ViewBarFilterDropdownFieldSelectMenuItemProps = {
  fieldMetadataItemToSelect: FieldMetadataItem;
};

export const ViewBarFilterDropdownFieldSelectMenuItem = ({
  fieldMetadataItemToSelect,
}: ViewBarFilterDropdownFieldSelectMenuItemProps) => {
  const { resetSelectedItem } = useSelectableList(FILTER_FIELD_LIST_ID);

  const isSelectedItemId = useAtomComponentFamilyStateValue(
    isSelectedItemIdComponentFamilyState,
    fieldMetadataItemToSelect.id,
  );

  const { initializeFilterOnFieldMetataItemFromViewBarFilterDropdown } =
    useInitializeFilterOnFieldMetadataItemFromViewBarFilterDropdown();

  const { getIcon } = useIcons();

  const Icon = getIcon(fieldMetadataItemToSelect.icon);

  const handleClick = () => {
    resetSelectedItem();

    initializeFilterOnFieldMetataItemFromViewBarFilterDropdown(
      fieldMetadataItemToSelect,
    );
  };

  const { currentView } = useGetCurrentViewOnly();

  let hasViewFilter = false;

  if (currentView) {
    hasViewFilter = currentView.viewFilters.filter(
      viewFilter => viewFilter.fieldMetadataId === fieldMetadataItemToSelect.id
    ).length > 0
  }

  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  let hasAdminRole = false

  if (currentWorkspaceMember && currentWorkspaceMember.id) {
    const {
      roles,
      allRoles,
      loading: rolesLoading,
    } = useWorkspaceMemberRoles(currentWorkspaceMember?.id);

    if (!rolesLoading && roles) {
      const adminRoles = roles.filter(role => role.label === "Admin")
      hasAdminRole = adminRoles.length > 0
    }
  }

  if (hasViewFilter && !hasAdminRole) {
    return <></>
  }


  return (
    <SelectableListItem
      itemId={fieldMetadataItemToSelect.id}
      onEnter={handleClick}
    >
      <MenuItem
        focused={isSelectedItemId}
        onClick={handleClick}
        LeftIcon={Icon}
        text={fieldMetadataItemToSelect.label}
      />
    </SelectableListItem>
  );
};
