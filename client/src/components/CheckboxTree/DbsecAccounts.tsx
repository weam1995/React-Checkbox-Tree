import React from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { TreeItem } from './types';
import CheckboxTree from './CheckboxTree';
import { setSelectedItemsTwo } from '@/store/checkboxTreeSlice';

interface DbsecAccountsProps {
  treeData: TreeItem[];
  className?: string;
}

const DbsecAccounts: React.FC<DbsecAccountsProps> = ({
  treeData,
  className = ''
}) => {
  const dispatch = useAppDispatch();
  
  // Get selected items from Redux store
  const selectedItems = useAppSelector(state => state.checkboxTree.selectedItemsTwo);

  // Handle selection changes
  const handleSelectionChange = (newSelectedItems: string[]) => {
    dispatch(setSelectedItemsTwo(newSelectedItems));
    console.log("Dbsec Accounts - Selected items:", newSelectedItems);
  };

  return (
    <div className={`dbsec-accounts-tree ${className}`}>
      <h3 className="text-md font-semibold text-primary mb-2">Dbsec Accounts</h3>
      <CheckboxTree
        items={treeData}
        selectedItems={selectedItems}
        onSelectionChange={handleSelectionChange}
        className="border-t-0"
        treeIndex={2}
      />
    </div>
  );
};

export default DbsecAccounts;